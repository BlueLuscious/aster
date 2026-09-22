import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { NodeRepositoryFileSystem } from "../../tooling/shared/runtime/node-repository-file-system.mjs";
import { RepositoryDirectoryReader } from "../../tooling/shared/runtime/repository-directory.reader.mjs";
import { RepositoryFileWalker } from "../../tooling/shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../tooling/shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

test("resolves containment without accepting sibling or parent paths", () => {
  const paths = new RepositoryPathResolver();
  const root = paths.resolve("fixture", "workspace");

  assert.equal(paths.contains(root, root), true);
  assert.equal(paths.contains(root, paths.resolve(root, "docs", "index.md")), true);
  assert.equal(paths.contains(root, paths.resolve(root, "..", "workspace-copy")), false);
  assert.equal(paths.contains(root, paths.resolve(root, "..")), false);
});

test("reads optional directories and walks selected files deterministically", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-repository-foundations-"));
  const fileSystem = new NodeRepositoryFileSystem();
  const paths = new RepositoryPathResolver();
  const directories = new RepositoryDirectoryReader(fileSystem);
  const files = new RepositoryFileWalker(fileSystem, paths);

  try {
    await mkdir(resolve(root, "zeta", "nested"), { recursive: true });
    await mkdir(resolve(root, "alpha"), { recursive: true });
    await writeFile(resolve(root, "zeta", "nested", "second.md"), "second\n", "utf8");
    await writeFile(resolve(root, "alpha", "first.md"), "first\n", "utf8");
    await writeFile(resolve(root, "ignored.txt"), "ignored\n", "utf8");

    assert.deepEqual(await directories.read(root), ["alpha", "zeta"]);
    assert.deepEqual(await directories.read(resolve(root, "absent")), []);
    assert.deepEqual(
      (await files.collect(root, (path) => path.endsWith(".md"))).map((path) =>
        paths.display(root, path),
      ),
      ["alpha/first.md", "zeta/nested/second.md"],
    );
    assert.deepEqual(await files.collect(resolve(root, "absent"), () => true), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reads strict JSON objects and rejects malformed or non-object input", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-repository-json-"));
  const json = new RepositoryJsonReader(new NodeRepositoryFileSystem());

  try {
    const validPath = resolve(root, "valid.json");
    const malformedPath = resolve(root, "malformed.json");
    const arrayPath = resolve(root, "array.json");

    await writeFile(validPath, '{"name":"aster"}\n', "utf8");
    await writeFile(malformedPath, '{"name":}\n', "utf8");
    await writeFile(arrayPath, "[]\n", "utf8");

    assert.deepEqual(await json.read(validPath), { name: "aster" });
    await assert.rejects(json.read(malformedPath), SyntaxError);
    await assert.rejects(json.read(arrayPath), /must contain an object/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
