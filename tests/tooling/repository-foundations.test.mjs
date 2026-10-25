import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { NodeRepositoryFileSystem } from "../../tooling/shared/runtime/node-repository-file-system.mjs";
import { RepositoryDirectoryReader } from "../../tooling/shared/runtime/repository-directory.reader.mjs";
import { RepositoryFileWalker } from "../../tooling/shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../tooling/shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

test("keeps every tooling contract and type independent from runtime classes", async () => {
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.name.endsWith(".contract.mjs") || entry.name.endsWith(".type.mjs")) {
        assert.doesNotMatch(await readFile(path, "utf8"), /(?:import\(["']|from\s+["'])[^"'\n]*\/runtime\//u, path);
      }
    }
  };
  await visit(fileURLToPath(new URL("../../tooling", import.meta.url)));
});

test("keeps parsed repository JSON independent from inherited fields at every object level", async () => {
  const reader = new RepositoryJsonReader({
    async readText() { return '{"nested":{},"items":[{}],"__proto__":{"marker":"own"}}'; },
  });
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, "undeclared");
  let reads = 0;
  try {
    Object.defineProperty(Object.prototype, "undeclared", {
      configurable: true,
      get() { reads += 1; return "inherited"; },
    });
    const record = await reader.read("fixture.json");
    for (const value of [record, record.nested, record.items[0], record.__proto__]) {
      assert.equal(Object.getPrototypeOf(value), null);
      assert.equal(value.undeclared, undefined);
    }
    assert.equal(Object.hasOwn(record, "__proto__"), true);
    assert.equal(record.__proto__.marker, "own");
    assert.equal(reads, 0);
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, "undeclared");
    } else {
      Object.defineProperty(Object.prototype, "undeclared", previous);
    }
  }
});

test("resolves containment without accepting sibling or parent paths", () => {
  const paths = new RepositoryPathResolver();
  const root = paths.resolve("fixture", "workspace");

  assert.equal(paths.contains(root, root), true);
  assert.equal(paths.contains(root, paths.resolve(root, "docs", "index.md")), true);
  assert.equal(paths.contains(root, paths.resolve(root, "..", "workspace-copy")), false);
  assert.equal(paths.contains(root, paths.resolve(root, "..")), false);
});

test("rejects paths on another Windows volume", { skip: process.platform !== "win32" }, () => {
  const paths = new RepositoryPathResolver();

  assert.equal(paths.contains("C:\\aster", "D:\\external\\icon.md"), false);
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

    const record = await json.read(validPath);
    assert.equal(Object.getPrototypeOf(record), null);
    assert.deepEqual({ ...record }, { name: "aster" });
    await assert.rejects(json.read(malformedPath), SyntaxError);
    await assert.rejects(json.read(arrayPath), /must contain an object/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
