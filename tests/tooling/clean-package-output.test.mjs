import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { cleanPackageOutput } from "../../tooling/workspace/clean-package-output.mjs";

async function createPackageFixture() {
  const root = await mkdtemp(join(tmpdir(), "aster-cleaner-"));

  await writeFile(resolve(root, "package.json"), "{}\n", "utf8");
  await mkdir(resolve(root, "dist/nested"), { recursive: true });
  await writeFile(resolve(root, "dist/nested/generated.js"), "generated\n", "utf8");
  await mkdir(resolve(root, "src"), { recursive: true });
  await writeFile(resolve(root, "src/index.ts"), "source\n", "utf8");

  return root;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

test("removes only the direct package dist directory", async () => {
  const root = await createPackageFixture();

  try {
    await cleanPackageOutput(root, "dist");

    assert.equal(await exists(resolve(root, "dist")), false);
    assert.equal(await readFile(resolve(root, "src/index.ts"), "utf8"), "source\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("tolerates an absent package dist directory", async () => {
  const root = await createPackageFixture();

  try {
    await cleanPackageOutput(root, "dist");
    await cleanPackageOutput(root, "dist");

    assert.equal(await exists(resolve(root, "dist")), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects output outside the guarded boundary", async () => {
  const root = await createPackageFixture();

  try {
    await assert.rejects(
      cleanPackageOutput(root, "../outside"),
      /Refusing to clean anything except the direct package dist directory/u,
    );
    await assert.rejects(
      cleanPackageOutput(root, "."),
      /Refusing to clean anything except the direct package dist directory/u,
    );
    await assert.rejects(
      cleanPackageOutput(root, "build"),
      /Refusing to clean anything except the direct package dist directory/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
