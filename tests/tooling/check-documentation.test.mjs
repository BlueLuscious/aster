import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import { verifyDocumentation } from "../../tooling/documentation/check-documentation.mjs";

async function writeDocument(root, path, content) {
  const target = resolve(root, path);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "aster-documentation-"));

  await writeDocument(root, "docs/en/index.md", "# Documentation\n");
  await writeDocument(root, "docs/en/collections/index.md", "# Collections\n");
  await writeDocument(root, "docs/en/future-capabilities.md", "# Future Capabilities\n");
  await writeDocument(root, "docs/en/packages/index.md", "# Packages\n");
  await writeDocument(root, "docs/en/project/index.md", "# Project\n");
  await writeDocument(root, "docs/en/tooling/index.md", "# Tooling\n");

  return root;
}

test("accepts a canonical documentation fixture", async () => {
  const root = await createFixture();

  try {
    const result = await verifyDocumentation(root);

    assert.deepEqual(result.issues, []);
    assert.equal(result.markdownFileCount, 6);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects documentation for a missing package", async () => {
  const root = await createFixture();

  try {
    await writeDocument(root, "docs/en/packages/ghost/index.md", "# Ghost\n");

    const result = await verifyDocumentation(root);

    assert.ok(
      result.issues.some((issue) => /missing packages member: ghost/u.test(issue)),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("compares authored feature directories without treating generated output as a feature", async () => {
  const root = await createFixture();

  try {
    await writeDocument(root, "docs/en/packages/icons/index.md", "# Icons\n");
    await writeDocument(root, "docs/en/packages/icons/old/index.md", "# Old\n");
    await mkdir(resolve(root, "packages/icons/src/glyphs"), { recursive: true });
    await mkdir(resolve(root, "packages/icons/src/generated"), { recursive: true });

    const result = await verifyDocumentation(root);

    assert.deepEqual(result.issues, [
      "Missing icons feature documentation for source member: glyphs",
      "Documentation describes a missing icons source feature: old",
    ]);

    await writeDocument(root, "docs/en/packages/icons/glyphs/index.md", "# Glyphs\n");
    await writeDocument(root, "docs/en/packages/icons/releases/index.md", "# Releases\n");
    await writeDocument(root, "docs/en/packages/icons/releases/0.1.0.md", "# Icons 0.1.0\n");
    await rm(resolve(root, "docs/en/packages/icons/old/index.md"));
    await rmdir(resolve(root, "docs/en/packages/icons/old"));

    assert.deepEqual((await verifyDocumentation(root)).issues, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("accepts collection documentation without a prescribed source root", async () => {
  const root = await createFixture();

  try {
    await writeDocument(
      root,
      "docs/en/collections/sample/index.md",
      "# Sample Collection\n",
    );

    const result = await verifyDocumentation(root);

    assert.deepEqual(result.issues, []);
    assert.equal(result.markdownFileCount, 7);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("ignores Markdown outside the accepted canonical hierarchy", async () => {
  const root = await createFixture();

  try {
    await writeDocument(
      root,
      "docs/en/notes/index.md",
      "# Notes\n\n[Missing](missing.md)\n\nSee plans/private.md.\n",
    );

    const result = await verifyDocumentation(root);

    assert.deepEqual(result.issues, []);
    assert.equal(result.markdownFileCount, 6);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects broken links and local-only references", async () => {
  const root = await createFixture();

  try {
    const projectPath = resolve(root, "docs/en/project/index.md");
    const project = await readFile(projectPath, "utf8");

    await writeFile(
      projectPath,
      `${project}\n[Missing](missing.md)\n\nSee plans/private.md.\n`,
      "utf8",
    );

    const result = await verifyDocumentation(root);

    assert.ok(
      result.issues.some((issue) => /contains a broken local link/u.test(issue)),
    );
    assert.ok(
      result.issues.some((issue) => /contains a local planning path/u.test(issue)),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
