import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import { catalogueSourceGeneration } from "../../tooling/catalogue/constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceSynchroniser } from "../../tooling/catalogue/runtime/catalogue-source.synchroniser.mjs";
import { NodeCatalogueSourceFileSystem } from "../../tooling/catalogue/runtime/node-catalogue-source-file-system.mjs";
import { RepositoryFileWalker } from "../../tooling/shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

const paths = new RepositoryPathResolver();
const ownedRoot = "src/generated/facades";
const manifestPath = "src/generated/manifest/index.ts";
const dynamicPath = "src/generated/dynamic/index.ts";
const leafPath = `${ownedRoot}/icons/camera/outline.ts`;

function output(root, relativePath, content = "generated\n") {
  return Object.freeze({ path: resolve(root, relativePath), relativePath, content });
}

function synchroniser(root, options = {}) {
  const fileSystem = options.fileSystem ?? new NodeCatalogueSourceFileSystem();
  return new CatalogueSourceSynchroniser(
    fileSystem,
    { reset() {}, async inspect() { return Object.freeze([]); } },
    { plan() { return options.facadePlan ? options.facadePlan() : options.facades ?? []; } },
    { plan() { return options.manifest ?? output(root, manifestPath); } },
    { plan() { return options.dynamic ?? output(root, dynamicPath); } },
    paths,
    { validate() {} },
    new RepositoryFileWalker(fileSystem, paths),
    catalogueSourceGeneration.families,
    options.ownedRoot ?? ownedRoot,
  );
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "aster-catalogue-publication-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function write(root, relativePath, content) {
  const path = resolve(root, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

test("validates complete publication ownership before any filesystem comparison or write", async (t) => {
  const root = resolve("fixture");
  const invalidPlans = [
    { name: "package root", options: { ownedRoot: "." }, pattern: /escapes its package/u },
    { name: "escaped directory", options: { ownedRoot: "../outside" }, pattern: /escapes its package/u },
    { name: "source ancestor", options: { ownedRoot: "src" }, pattern: /overlaps canonical sources/u },
    { name: "source descendant", options: { ownedRoot: "src/glyphs/owned" }, pattern: /overlaps canonical sources/u },
    { name: "source output", options: { manifest: output(root, "src/collections/generated.ts") }, pattern: /overlaps canonical sources/u },
    { name: "escaped fixed file", options: { manifest: output(root, "../manifest.ts") }, pattern: /escapes its package/u },
    { name: "fixed file within directory", options: { manifest: output(root, leafPath) }, pattern: /Overlapping generated publication/u },
    { name: "fixed file above directory", options: { manifest: output(root, "src/generated") }, pattern: /Overlapping generated publication/u },
    { name: "duplicate fixed file", options: { dynamic: output(root, manifestPath) }, pattern: /Overlapping generated publication/u },
    { name: "case-only fixed file", options: { dynamic: output(root, manifestPath.toUpperCase()) }, pattern: /Overlapping generated publication/u },
    { name: "escaped directory file", options: { facades: [output(root, "src/unowned.ts")] }, pattern: /Invalid generated output path/u },
    { name: "file at directory root", options: { facades: [output(root, ownedRoot)] }, pattern: /Invalid generated output path/u },
    { name: "mismatched relative path", options: { facades: [{ ...output(root, leafPath), relativePath: "incorrect.ts" }] }, pattern: /Invalid generated output path/u },
    { name: "non-canonical absolute path", options: { facades: [{ ...output(root, leafPath), path: `${resolve(root, ownedRoot)}/../facades/icons/camera/outline.ts` }] }, pattern: /Invalid generated output path/u },
    { name: "duplicate directory file", options: { facades: [output(root, leafPath), output(root, leafPath)] }, pattern: /Duplicate generated output path/u },
    { name: "case-only directory file", options: { facades: [output(root, leafPath), output(root, `${ownedRoot}/icons/camera/Outline.ts`)] }, pattern: /Duplicate generated output path/u },
    { name: "file and directory conflict", options: { facades: [output(root, `${ownedRoot}/icons/camera`), output(root, leafPath)] }, pattern: /Overlapping generated output paths/u },
  ];

  for (const candidate of invalidPlans) {
    await t.test(candidate.name, async () => {
      const touched = [];
      const fileSystem = Object.fromEntries(
        ["exists", "entries", "readText", "writeText", "replaceDirectory"].map((method) => [
          method,
          async () => { touched.push(method); throw new Error("Unexpected filesystem access"); },
        ]),
      );
      const subject = synchroniser(root, { ...candidate.options, fileSystem });
      await assert.rejects(subject.synchronise(root, true), candidate.pattern);
      await assert.rejects(subject.synchronise(root, false), candidate.pattern);
      assert.deepEqual(touched, []);
    });
  }
});

test("finishes all planning before comparing or publishing earlier outputs", async () => {
  const root = resolve("fixture");
  const subject = synchroniser(root, {
    fileSystem: {
      async exists() { assert.fail("Planning must finish before comparison"); },
      async writeText() { assert.fail("Planning must finish before publication"); },
      async replaceDirectory() { assert.fail("Planning must finish before publication"); },
    },
    facadePlan() { throw new Error("Facade planning failed"); },
  });
  await assert.rejects(subject.synchronise(root, false), /Facade planning failed/u);
});

test("compares every publication group before writing any changed output", async (t) => {
  const root = await fixture(t);
  await write(root, manifestPath, "old manifest\n");
  await write(root, dynamicPath, "old dynamic\n");
  await write(root, leafPath, "old leaf\n");
  class FailingReadFileSystem extends NodeCatalogueSourceFileSystem {
    async readText(path) {
      if (path === resolve(root, leafPath)) {
        throw new Error("Directory comparison failed");
      }
      return super.readText(path);
    }
    async writeText() { assert.fail("No output may be written before all comparisons finish"); }
    async replaceDirectory() { assert.fail("No directory may be replaced before all comparisons finish"); }
  }
  await assert.rejects(synchroniser(root, {
    fileSystem: new FailingReadFileSystem(),
    facades: [output(root, leafPath)],
  }).synchronise(root, false), /Directory comparison failed/u);
  assert.equal(await readFile(resolve(root, manifestPath), "utf8"), "old manifest\n");
  assert.equal(await readFile(resolve(root, dynamicPath), "utf8"), "old dynamic\n");
  assert.equal(await readFile(resolve(root, leafPath), "utf8"), "old leaf\n");
});

test("shares ordered missing, stale and obsolete detection without writes in check-only mode", async (t) => {
  const root = await fixture(t);
  await write(root, manifestPath, "stale manifest\n");
  await write(root, leafPath, "stale leaf\n");
  const obsolete = [`${ownedRoot}/a.ts`, `${ownedRoot}/z.ts`];
  for (const path of [...obsolete].reverse()) {
    await write(root, path, "obsolete\n");
  }
  await write(root, "package.json", '{"private":true}\n');
  const subject = synchroniser(root, { facades: [output(root, leafPath)] });
  const result = await subject.synchronise(root, true);
  assert.deepEqual(result.changedPaths, [manifestPath, dynamicPath, leafPath, ...obsolete]);
  assert.equal(result.outputCount, 3);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.changedPaths));
  assert.equal(await readFile(resolve(root, leafPath), "utf8"), "stale leaf\n");
  await assert.rejects(readFile(resolve(root, dynamicPath), "utf8"), { code: "ENOENT" });
  assert.equal(await readFile(resolve(root, obsolete[0]), "utf8"), "obsolete\n");

  assert.deepEqual(await subject.synchronise(root, false), result);
  assert.deepEqual((await subject.synchronise(root, true)).changedPaths, []);
  assert.deepEqual((await subject.synchronise(root, false)).changedPaths, []);
  assert.equal(await readFile(resolve(root, "package.json"), "utf8"), '{"private":true}\n');
  assert.equal(await readFile(resolve(root, leafPath), "utf8"), "generated\n");
  for (const path of obsolete) {
    await assert.rejects(readFile(resolve(root, path), "utf8"), { code: "ENOENT" });
  }
});

test("cleans an empty owned directory without touching its siblings or manufacturing drift", async (t) => {
  const root = await fixture(t);
  const subject = synchroniser(root);
  const initial = await subject.synchronise(root, false);
  assert.deepEqual(initial.changedPaths, [manifestPath, dynamicPath]);
  await assert.rejects(readdir(resolve(root, ownedRoot)), { code: "ENOENT" });
  await write(root, `${ownedRoot}/obsolete.ts`, "obsolete\n");
  await write(root, "src/generated/unowned/retained.ts", "retained\n");
  assert.deepEqual((await subject.synchronise(root, true)).changedPaths, [`${ownedRoot}/obsolete.ts`]);
  assert.deepEqual((await subject.synchronise(root, false)).changedPaths, [`${ownedRoot}/obsolete.ts`]);
  assert.deepEqual(await readdir(resolve(root, ownedRoot)), []);
  assert.equal(await readFile(resolve(root, "src/generated/unowned/retained.ts"), "utf8"), "retained\n");
  assert.deepEqual((await subject.synchronise(root, false)).changedPaths, []);
});

test("does not rewrite either lifecycle when all expected files already match", async (t) => {
  const root = await fixture(t);
  const facades = [output(root, leafPath)];
  await synchroniser(root, { facades }).synchronise(root, false);
  class ReadOnlyFileSystem extends NodeCatalogueSourceFileSystem {
    async writeText() { assert.fail("Unchanged files must not be rewritten"); }
    async replaceDirectory() { assert.fail("Unchanged directories must not be replaced"); }
  }
  const result = await synchroniser(root, { facades, fileSystem: new ReadOnlyFileSystem() }).synchronise(root, false);
  assert.deepEqual(result, { changedPaths: [], outputCount: 3 });
});

test("reports and repairs independent file publication after a later write failure", async (t) => {
  const root = await fixture(t);
  class FailingWriteFileSystem extends NodeCatalogueSourceFileSystem {
    async writeText(path, content) {
      if (path === resolve(root, dynamicPath)) {
        throw new Error("Dynamic write failed");
      }
      return super.writeText(path, content);
    }
    async replaceDirectory() { assert.fail("Directory publication follows all fixed files"); }
  }
  const facades = [output(root, leafPath)];
  await assert.rejects(synchroniser(root, { facades, fileSystem: new FailingWriteFileSystem() }).synchronise(root, false), /Dynamic write failed/u);
  assert.equal(await readFile(resolve(root, manifestPath), "utf8"), "generated\n");
  await assert.rejects(readFile(resolve(root, dynamicPath), "utf8"), { code: "ENOENT" });
  await assert.rejects(readdir(resolve(root, ownedRoot)), { code: "ENOENT" });
  const subject = synchroniser(root, { facades });
  assert.deepEqual((await subject.synchronise(root, true)).changedPaths, [dynamicPath, leafPath]);
  assert.deepEqual((await subject.synchronise(root, false)).changedPaths, [dynamicPath, leafPath]);
  assert.deepEqual((await subject.synchronise(root, true)).changedPaths, []);
});

test("restores the previous directory after a real publication rename failure and supports retry", async (t) => {
  const root = await fixture(t);
  const directory = resolve(root, ownedRoot);
  await write(root, leafPath, "previous leaf\n");
  class MissingStageFileSystem extends NodeCatalogueSourceFileSystem {
    failed = false;
    async exists(path) {
      if (path === directory && !this.failed) {
        const stage = (await readdir(dirname(directory))).find((name) => name.startsWith("facades.stage-"));
        if (stage !== undefined) {
          const stagePath = resolve(dirname(directory), stage);
          assert.ok(paths.contains(root, stagePath));
          await rm(stagePath, { recursive: true, force: true });
          this.failed = true;
        }
      }
      return super.exists(path);
    }
  }
  const fileSystem = new MissingStageFileSystem();
  const subject = synchroniser(root, { fileSystem, facades: [output(root, leafPath)] });
  await assert.rejects(subject.synchronise(root, false), { code: "ENOENT" });
  assert.equal(fileSystem.failed, true);
  assert.equal(await readFile(resolve(root, leafPath), "utf8"), "previous leaf\n");
  assert.equal(await readFile(resolve(root, manifestPath), "utf8"), "generated\n");
  assert.equal(await readFile(resolve(root, dynamicPath), "utf8"), "generated\n");
  assert.deepEqual(await readdir(dirname(directory)), ["dynamic", "facades", "manifest"]);
  assert.deepEqual((await subject.synchronise(root, true)).changedPaths, [leafPath]);
  assert.deepEqual((await subject.synchronise(root, false)).changedPaths, [leafPath]);
  assert.equal(await readFile(resolve(root, leafPath), "utf8"), "generated\n");
  assert.deepEqual((await subject.synchronise(root, true)).changedPaths, []);
  assert.deepEqual(await readdir(dirname(directory)), ["dynamic", "facades", "manifest"]);
});
