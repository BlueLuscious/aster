import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { BenchmarkWorkspace } from "../../tooling/performance/shared/runtime/benchmark-workspace.mjs";
import { NodeProcessHost } from "../../tooling/performance/shared/runtime/node-process.host.mjs";
import { BenchmarkCatalogueFixtureFactory } from "../../tooling/performance/shared/runtime/benchmark-catalogue-fixture.factory.mjs";
import { BenchmarkModuleFixtureFactory } from "../../tooling/performance/icons/runtime/benchmark-module-fixture.factory.mjs";

test("captures complete bounded process evidence without inheriting profiler arguments", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    const entry = await workspace.write(
      "worker.mjs",
      "process.stdout.write(JSON.stringify({ args: process.execArgv, gc: typeof globalThis.gc }));",
    );
    const result = await new NodeProcessHost(workspace.root).executeBounded({
      executablePath: entry,
      arguments: [],
      exposeGc: true,
    });
    assert.equal(result.ok, true);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.equal(result.terminationError, null);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.args, ["--max-old-space-size=2048", "--expose-gc"]);
    assert.equal(output.gc, "function");
  } finally {
    await workspace.dispose();
  }
});

test("retains nonzero process status and rejects invalid budgets before acquiring a worker", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    const entry = await workspace.write(
      "worker.mjs",
      'process.stderr.write("failed"); process.exitCode = 3;',
    );
    const host = new NodeProcessHost(workspace.root);
    const result = await host.executeBounded({
      executablePath: entry,
      arguments: [],
    });
    assert.equal(result.ok, false);
    assert.equal(result.status, 3);
    assert.equal(result.stderr, "failed");
    const spawnFailure = await host.executeBounded({
      executablePath: "invalid\0file",
      arguments: [],
    });
    assert.equal(spawnFailure.ok, false);
    assert.equal(spawnFailure.reason, "spawn-error");
    assert.equal(spawnFailure.status, null);
    for (const request of [
      { timeoutMilliseconds: 0 },
      { timeoutMilliseconds: 120_001 },
      { maximumOutputBytes: Infinity },
      { maximumRssBytes: -1 },
    ]) {
      await assert.rejects(
        host.executeBounded({
          executablePath: entry,
          arguments: [],
          ...request,
        }),
        /budget/u,
      );
    }
  } finally {
    await workspace.dispose();
  }
});

test("reads bounded file requests, including UTF-8 BOM, without relying on command-line capacity", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    const module = await workspace.write(
      "leaf.mjs",
      "export const definition = { value: 1 };\n",
    );
    const request = await workspace.write(
      "request.json",
      `\uFEFF${JSON.stringify({ specifiers: [pathToFileURL(module).href] })}`,
    );
    const host = new NodeProcessHost(resolve("."));
    const executablePath = resolve(
      "tooling/performance/shared/native-module-import-probe.mjs",
    );
    const result = await host.executeBounded({
      executablePath,
      arguments: ["--request", request],
    });
    assert.equal(result.ok, true);
    assert.deepEqual(JSON.parse(result.stdout).exports[0].names, [
      "definition",
    ]);
    const tooLarge = await workspace.write("large.json", " ".repeat(8_388_609));
    const rejected = await host.executeBounded({
      executablePath,
      arguments: ["--request", tooLarge],
    });
    assert.equal(rejected.ok, false);
    assert.match(rejected.stderr, /byte budget/u);
  } finally {
    await workspace.dispose();
  }
});

test("stops excess output and RSS reports while retaining bounded partial evidence", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    for (const [name, code, options, reason] of [
      [
        "output",
        'process.stdout.write("x".repeat(10000)); setInterval(() => {}, 1000);',
        { maximumOutputBytes: 128 },
        "output-limit",
      ],
      [
        "rss",
        'process.send({type:"benchmark.rss",bytes:1000}); setInterval(() => {}, 1000);',
        { maximumRssBytes: 1 },
        "rss-limit",
      ],
      [
        "protocol",
        'process.send({type:"benchmark.rss",bytes:"invalid"}); setInterval(() => {}, 1000);',
        {},
        "resource-protocol",
      ],
    ]) {
      const entry = await workspace.write(`${name}.mjs`, code);
      const result = await new NodeProcessHost(workspace.root).executeBounded({
        executablePath: entry,
        arguments: [],
        ...options,
      });
      assert.equal(result.ok, false);
      assert.equal(result.reason, reason);
      assert.equal(result.terminationError, null);
      assert.ok(
        Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr) <=
          (options.maximumOutputBytes ?? 8_388_608),
      );
    }
  } finally {
    await workspace.dispose();
  }
});

test("terminates an owned live process tree on its deadline, including a non-detached descendant", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    const pidFile = join(workspace.root, "child.pid");
    const entry = await workspace.write(
      "tree.mjs",
      `import {spawn} from "node:child_process"; import {writeFileSync} from "node:fs"; const child=spawn(process.execPath,["--eval","setInterval(()=>{},1000)"],{stdio:"ignore",windowsHide:true}); writeFileSync(${JSON.stringify(pidFile)},String(child.pid)); setInterval(()=>{},1000);`,
    );
    const result = await new NodeProcessHost(workspace.root).executeBounded({
      executablePath: entry,
      arguments: [],
      timeoutMilliseconds: 2_000,
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "timeout");
    assert.equal(result.terminationError, null);
    const pid = Number(await readFile(pidFile, "utf8"));
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        process.kill(pid, 0);
      } catch (error) {
        if (error.code === "ESRCH") {
          break;
        }
        throw error;
      }
      await delay(20);
    }
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  } finally {
    await workspace.dispose();
  }
});

test("separates native first import, cached reference reuse and resource-instrumented runs", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    const fixture = new BenchmarkCatalogueFixtureFactory().createScaled({
      definitions: 3,
      variantsPerGlyph: 3,
    });
    const modules = await new BenchmarkModuleFixtureFactory().create(
      workspace,
      fixture.icons,
      pathToFileURL(resolve("packages/core/dist/index.js")).href,
    );
    const host = new NodeProcessHost(resolve("."));
    const executablePath = resolve(
      "tooling/performance/shared/native-module-import-probe.mjs",
    );
    const first = await host.executeBounded({
      executablePath,
      arguments: [JSON.stringify({ specifiers: modules.leaves })],
    });
    const second = await host.executeBounded({
      executablePath,
      arguments: [JSON.stringify({ specifiers: modules.leaves })],
    });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    const a = JSON.parse(first.stdout);
    const b = JSON.parse(second.stdout);
    assert.equal(a.instrumentation, false);
    assert.equal(a.resolved.length, 3);
    assert.equal(a.cachedReferencesRetained, true);
    assert.deepEqual(a.exports, b.exports);
    assert.ok(a.firstImportNanoseconds >= 0 && a.cachedImportNanoseconds >= 0);
    const observed = await host.executeBounded({
      executablePath,
      arguments: [
        JSON.stringify({ specifiers: modules.glyphs, resources: true }),
      ],
      exposeGc: true,
    });
    assert.equal(observed.ok, true);
    const resources = JSON.parse(observed.stdout);
    assert.equal(resources.resources.instrumented, true);
    assert.ok(
      resources.resources.lifetimeMaxRssAfterBytes >=
        resources.resources.lifetimeMaxRssBeforeBytes,
    );
    assert.ok(resources.resources.postGcHeapUsedBytes > 0);
    assert.ok(Array.isArray(resources.resources.gcEvents));
    const duplicates = await host.executeBounded({
      executablePath,
      arguments: [
        JSON.stringify({ specifiers: [modules.leaves[0], modules.leaves[0]] }),
      ],
    });
    assert.equal(duplicates.ok, false);
    assert.match(duplicates.stderr, /repeated modules/u);
    const cacheBusting = await host.executeBounded({
      executablePath,
      arguments: [
        JSON.stringify({
          specifiers: [modules.leaves[0], `${modules.leaves[0]}?copy=one`],
        }),
      ],
    });
    assert.equal(cacheBusting.ok, false);
    assert.match(cacheBusting.stderr, /repeated modules/u);
    const loaders = await host.executeBounded({
      executablePath,
      arguments: [
        JSON.stringify({
          specifiers: ["@luscious-garden/aster-icons/dynamic"],
        }),
      ],
    });
    assert.equal(loaders.ok, true);
    assert.ok(JSON.parse(loaders.stdout).exports[0].signature.length > 0);
    const invalid = await host.executeBounded({
      executablePath,
      arguments: [
        JSON.stringify({ specifiers: modules.leaves, resource: true }),
      ],
    });
    assert.equal(invalid.ok, false);
    assert.match(invalid.stderr, /Invalid native/u);
    const throwing = await workspace.write(
      "resource-failure.mjs",
      `import {BenchmarkResourceObserver} from ${JSON.stringify(pathToFileURL(resolve("tooling/performance/shared/runtime/benchmark-resource.observer.mjs")).href)}; await new BenchmarkResourceObserver().measure(() => {throw new Error("resource-workload-failed");});`,
    );
    const failed = await host.executeBounded({
      executablePath: throwing,
      arguments: [],
      exposeGc: true,
    });
    assert.equal(failed.reason, "exit");
    assert.equal(failed.ok, false);
    assert.match(failed.stderr, /resource-workload-failed/u);
  } finally {
    await workspace.dispose();
  }
});
