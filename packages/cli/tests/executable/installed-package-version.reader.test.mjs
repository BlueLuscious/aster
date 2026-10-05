import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { installedAsterPackages } from "../../dist/shell/version/constants/installed-aster-packages.constant.js";
import { InstalledPackageVersionReader } from "../../dist/shell/version/runtime/installed-package-version.reader.js";

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
    for (const { selector, name } of installedAsterPackages) {
      const path = manifestPath(root, selector);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify({
        name,
        version: versions[selector],
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

test("resolves four independently versioned manifests relative to the CLI", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new InstalledPackageVersionReader(fixture.base);

  assert.notEqual(fixture.root, process.cwd());

  const result = await reader.read("all");

  assert.deepEqual(result, [
    { name: "@luscious-garden/aster-core", version: versions.core },
    { name: "@luscious-garden/aster-icons", version: versions.icons },
    { name: "@luscious-garden/aster-svg", version: versions.svg },
    { name: "@luscious-garden/aster-cli", version: versions.cli },
  ]);
  assert.ok(Object.isFrozen(result));
  assert.ok(result.every((entry) => Object.isFrozen(entry)));
});

test("reads only the named package even when unrelated manifests are malformed", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new InstalledPackageVersionReader(fixture.base);

  await writeFile(manifestPath(fixture.root, "icons"), "{broken", "utf8");
  await writeFile(manifestPath(fixture.root, "svg"), "null", "utf8");

  assert.deepEqual(await reader.read("core"), [
    { name: "@luscious-garden/aster-core", version: versions.core },
  ]);
  assert.deepEqual(await reader.read("cli"), [
    { name: "@luscious-garden/aster-cli", version: versions.cli },
  ]);
  await assert.rejects(reader.read("all"));
});

test("reads package metadata without loading a root export or definition module", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new InstalledPackageVersionReader(fixture.base);

  assert.deepEqual(await reader.read("icons"), [
    { name: "@luscious-garden/aster-icons", version: versions.icons },
  ]);
});

test("rejects absent and invalid selected manifests without partial evidence", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new InstalledPackageVersionReader(fixture.base);
  const path = manifestPath(fixture.root, "svg");

  await rm(path);
  await assert.rejects(reader.read("svg"));
  await assert.rejects(reader.read("all"));

  for (const content of [
    "{broken",
    "null",
    "[]",
    JSON.stringify({ name: "@luscious-garden/other", version: "1.0.0" }),
    JSON.stringify({ name: "@luscious-garden/aster-svg", version: "" }),
    JSON.stringify({ name: "@luscious-garden/aster-svg", version: "  " }),
    JSON.stringify({ name: "@luscious-garden/aster-svg", version: " 1.0.0 " }),
    JSON.stringify({ name: "@luscious-garden/aster-svg", version: 1 }),
  ]) {
    await writeFile(path, content, "utf8");
    await assert.rejects(reader.read("svg"));
  }
});

test("rejects a selector outside the closed public package family", async (context) => {
  const fixture = await createFixture();
  context.after(() => removeFixture(fixture.root));
  const reader = new InstalledPackageVersionReader(fixture.base);

  await assert.rejects(reader.read("import"), TypeError);
});
