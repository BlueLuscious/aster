import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { BenchmarkRunner } from "../../tooling/performance/shared/runtime/benchmark.runner.mjs";
import { NumericSampleStatistics } from "../../tooling/performance/shared/runtime/numeric-sample.statistics.mjs";
import { PackageDistributionInspector } from "../../tooling/performance/shared/runtime/package-distribution.inspector.mjs";
import { NodeRepositoryFileSystem } from "../../tooling/shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../tooling/shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../tooling/shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

test("aggregates deterministic timing and heap samples through a fake host", () => {
  const clock = [0n, 20n, 100n, 140n, 200n, 260n];
  const heap = [100, 120, 200, 180, 300, 360];
  let collections = 0;
  let availabilityChecks = 0;
  const executions = [];
  const runner = new BenchmarkRunner(
    {
      assertAvailable() {
        availabilityChecks += 1;
      },
      collectGarbage() {
        collections += 1;
      },
      now() {
        return clock.shift();
      },
      heapUsed() {
        return heap.shift();
      },
      environment() {
        return Object.freeze({});
      },
    },
    new NumericSampleStatistics(),
    { warmupOperations: 3, sampleCount: 3 },
  );

  const result = runner.measure({
    name: "fixture.operation",
    operationsPerSample: 2,
    execute(iterations) {
      executions.push(iterations);
      return executions.length;
    },
  });

  assert.deepEqual(result, {
    name: "fixture.operation",
    operationsPerSample: 2,
    medianNanosecondsPerOperation: 20,
    minimumNanosecondsPerOperation: 10,
    maximumNanosecondsPerOperation: 30,
    medianHeapGrowthBytesPerOperation: 10,
    checksum: 4,
  });
  assert.deepEqual(executions, [3, 2, 2, 2]);
  assert.equal(availabilityChecks, 1);
  assert.equal(collections, 3);
  assert.deepEqual(runner.methodology(), {
    sampleCount: 3,
    warmupOperations: 3,
    timing: "median high-resolution elapsed nanoseconds per operation",
    memory:
      "median non-negative heap growth bytes per operation after forced pre-sample collection",
  });
});

test("inspects an isolated emitted-package fixture deterministically", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-distribution-inspector-"));
  const fileSystem = new NodeRepositoryFileSystem();
  const paths = new RepositoryPathResolver();
  const inspector = new PackageDistributionInspector(
    fileSystem,
    new RepositoryJsonReader(fileSystem),
    paths,
    new RepositoryFileWalker(fileSystem, paths),
  );
  const moduleSource = "export const fixture = true;\n";
  const declarationSource = "export declare const fixture: true;\n";

  try {
    await mkdir(resolve(root, "dist", "nested"), { recursive: true });
    await writeFile(
      resolve(root, "package.json"),
      JSON.stringify({
        exports: { "./zeta": "./dist/zeta.js", ".": "./dist/index.js" },
        sideEffects: false,
      }),
      "utf8",
    );
    await writeFile(resolve(root, "dist", "index.js"), moduleSource, "utf8");
    await writeFile(
      resolve(root, "dist", "nested", "index.d.ts"),
      declarationSource,
      "utf8",
    );
    await writeFile(resolve(root, "dist", "ignored.map"), "{}\n", "utf8");

    assert.deepEqual(await inspector.inspect(root), {
      moduleFiles: 1,
      moduleBytes: Buffer.byteLength(moduleSource),
      declarationFiles: 1,
      declarationBytes: Buffer.byteLength(declarationSource),
      exports: [".", "./zeta"],
      sideEffects: false,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
