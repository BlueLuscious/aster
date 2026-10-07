import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { asterPublicPackages } from "../../dist/shell/version/constants/aster-public-packages.constant.js";
import { CliPackageVersionReader } from "../../dist/shell/version/runtime/cli-package-version.reader.js";
import { NodeShell } from "../../dist/shell/runtime/node-shell.js";

const versions = Object.freeze({
  core: "0.2.0",
  icons: "0.1.7",
  svg: "0.4.0-rc.2",
  cli: "0.1.3",
});

function manifestPath(root, selector) {
  return join(
    root,
    "node_modules",
    "@luscious-garden",
    `aster-${selector}`,
    "package.json",
  );
}

async function removeFixture(root) {
  const ownedName = relative(resolve(tmpdir()), resolve(root));
  assert.match(ownedName, /^aster-cli-version-[^\\/]+$/u);
  await rm(root, { recursive: true, force: true });
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "aster-cli-version-"));
  const entrypoint = join(
    root,
    "node_modules",
    "@luscious-garden",
    "aster-cli",
    "dist",
    "shell",
    "aster.js",
  );

  try {
    for (const { selector, name } of asterPublicPackages) {
      const path = manifestPath(root, selector);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify({
        name,
        version: versions[selector],
        ...(selector === "cli" ? { dependencies: {
          "@luscious-garden/aster-core": "^0.2.0",
          "@luscious-garden/aster-icons": "^0.1.0",
        } } : {}),
        ...(selector === "icons" ? { exports: { ".": null } } : {}),
      }), "utf8");
    }

    await mkdir(dirname(entrypoint), { recursive: true });
    await writeFile(entrypoint, "export {};\n", "utf8");

    return Object.freeze({ root, base: pathToFileURL(entrypoint) });
  } catch (error) {
    await removeFixture(root);
    throw error;
  }
}

test("resolves only declared direct Aster dependencies relative to the executed CLI", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new CliPackageVersionReader(fixture.base);

  assert.notEqual(fixture.root, process.cwd());

  const result = await reader.readDependencies();

  assert.deepEqual(result, {
    root: { name: "@luscious-garden/aster-cli", version: versions.cli },
    dependencies: [
      { name: "@luscious-garden/aster-core", version: versions.core },
      { name: "@luscious-garden/aster-icons", version: versions.icons },
    ],
  });
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.root));
  assert.ok(Object.isFrozen(result.dependencies));
  assert.ok(result.dependencies.every((entry) => Object.isFrozen(entry)));
});

test("ignores unrelated and non-runtime manifests", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new CliPackageVersionReader(fixture.base);

  await writeFile(manifestPath(fixture.root, "svg"), "null", "utf8");
  assert.equal((await reader.readDependencies()).dependencies.length, 2);
});

test("reads package metadata without loading a closed root export", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new CliPackageVersionReader(fixture.base);

  assert.equal((await reader.readDependencies()).dependencies[1].version, versions.icons);
});

test("rejects absent and invalid required dependency manifests without partial evidence", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new CliPackageVersionReader(fixture.base);
  const path = manifestPath(fixture.root, "icons");

  await rm(path);
  await assert.rejects(reader.readDependencies());

  for (const content of [
    "{broken",
    "null",
    "[]",
    JSON.stringify({ name: "@luscious-garden/other", version: "1.0.0" }),
    JSON.stringify({ name: "@luscious-garden/aster-icons", version: "" }),
    JSON.stringify({ name: "@luscious-garden/aster-icons", version: "  " }),
    JSON.stringify({ name: "@luscious-garden/aster-icons", version: " 1.0.0 " }),
    JSON.stringify({ name: "@luscious-garden/aster-icons", version: 1 }),
  ]) {
    await writeFile(path, content, "utf8");
    await assert.rejects(reader.readDependencies());
  }
});

test("rejects malformed declarations and self-dependencies", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new CliPackageVersionReader(fixture.base);

  const path = manifestPath(fixture.root, "cli");
  for (const dependencies of [
    null,
    [],
    { "@luscious-garden/aster-core": 2 },
    { "@luscious-garden/aster-cli": "^0.1.0" },
  ]) {
    await writeFile(path, JSON.stringify({
      name: "@luscious-garden/aster-cli", version: versions.cli, dependencies,
    }), "utf8");
    await assert.rejects(reader.readDependencies());
  }
});

test("reports the executed CLI's complete Aster dependency view on request", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const shell = new NodeShell("Aster", versions.cli, process.cwd(), fixture.base);

  const all = await shell.execute(["version", "cli", "--deps"]);
  const alias = await shell.execute(["version", "--deps"]);
  const allJson = await shell.execute(["version", "cli", "--deps", "--json"]);
  const aliasJson = await shell.execute(["version", "--deps", "--json"]);

  assert.equal(all.stdout, [
    "Executed CLI dependencies:",
    `@luscious-garden/aster-cli ${versions.cli}`,
    `  @luscious-garden/aster-core ${versions.core}`,
    `  @luscious-garden/aster-icons ${versions.icons}`,
    "",
  ].join("\n"));
  assert.equal(all.stderr, "");
  assert.equal(all.exitCode, 0);
  assert.deepEqual(alias, all);
  assert.equal(JSON.parse(allJson.stdout).payload.source, "cli");
  assert.deepEqual(aliasJson, allJson);
  assert.deepEqual(JSON.parse(allJson.stdout).payload, {
    kind: "package-dependencies",
    source: "cli",
    groups: [{
      root: { name: "@luscious-garden/aster-cli", version: versions.cli },
      dependencies: [
        { name: "@luscious-garden/aster-core", version: versions.core },
        { name: "@luscious-garden/aster-icons", version: versions.icons },
      ],
    }],
  });
  assert.equal(allJson.stderr, "");
  assert.equal(allJson.exitCode, 0);

  await writeFile(manifestPath(fixture.root, "icons"), "{broken", "utf8");
  assert.deepEqual(await shell.execute(["version", "cli"]), {
    stdout: `@luscious-garden/aster-cli ${versions.cli}\n`,
    stderr: "",
    exitCode: 0,
  });
  const failed = await shell.execute(["version", "cli", "--deps"]);
  assert.equal(failed.exitCode, 1);
  assert.match(failed.stderr, /^\[ASTER-CLI-011\] Invalid or unavailable dependencies for @luscious-garden\/aster-cli/u);
});

test("plain and named CLI versions do not read broken CLI dependency metadata", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const shell = new NodeShell("Aster", versions.cli, process.cwd(), fixture.base);

  for (const { selector } of asterPublicPackages) {
    await writeFile(manifestPath(fixture.root, selector), "{broken", "utf8");
  }

  assert.deepEqual(await shell.execute(["version"]), {
    stdout: `Aster ${versions.cli}\n`,
    stderr: "",
    exitCode: 0,
  });
  assert.deepEqual(JSON.parse((await shell.execute(["version", "--json"])).stdout), {
    ok: true,
    command: "version",
    payload: { kind: "version", productName: "Aster", productVersion: versions.cli },
  });

  assert.deepEqual(await shell.execute(["version", "cli"]), {
    stdout: `@luscious-garden/aster-cli ${versions.cli}\n`,
    stderr: "",
    exitCode: 0,
  });

  const json = await shell.execute(["version", "cli", "--deps", "--json"]);
  assert.equal(json.exitCode, 1);
  assert.equal(json.stderr, "");
  assert.equal(JSON.parse(json.stdout).diagnostic.code, "ASTER-CLI-011");
  assert.doesNotMatch(json.stdout, /aster-cli-version-|package\.json/u);
});
