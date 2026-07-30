import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
  await writeDocument(root, "docs/en/architecture/index.md", "# Architecture\n");
  await writeDocument(root, "docs/en/collections/index.md", "# Collections\n");
  await writeDocument(root, "docs/en/governance/index.md", "# Governance\n");
  await writeDocument(root, "docs/en/packages/index.md", "# Packages\n");
  await writeDocument(
    root,
    "docs/en/decisions/index.md",
    "# Decisions\n\n- [0001: Fixture](0001-fixture.md)\n",
  );
  await writeDocument(
    root,
    "docs/en/decisions/0001-fixture.md",
    "# 0001: Fixture\n\nStatus: **Accepted**\n\n## Consequences\n\nNone.\n",
  );

  return root;
}

test("accepts a canonical documentation fixture", async () => {
  const root = await createFixture();

  try {
    const result = await verifyDocumentation(root);

    assert.deepEqual(result.issues, []);
    assert.equal(result.markdownFileCount, 7);
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

test("accepts collection documentation without a prescribed source root", async () => {
  const root = await createFixture();

  try {
    await writeDocument(
      root,
      "docs/en/collections/aster/index.md",
      "# Aster Collection\n",
    );

    const result = await verifyDocumentation(root);

    assert.deepEqual(result.issues, []);
    assert.equal(result.markdownFileCount, 8);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects broken links and local-only references", async () => {
  const root = await createFixture();

  try {
    const governancePath = resolve(root, "docs/en/governance/index.md");
    const governance = await readFile(governancePath, "utf8");

    await writeFile(
      governancePath,
      `${governance}\n[Missing](missing.md)\n\nSee plans/private.md.\n`,
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

test("rejects a malformed decision record", async () => {
  const root = await createFixture();

  try {
    await writeDocument(
      root,
      "docs/en/decisions/0001-fixture.md",
      "# 0001: Fixture\n\nStatus: **Draft**\n",
    );

    const result = await verifyDocumentation(root);

    assert.ok(
      result.issues.some((issue) => /has no accepted decision status/u.test(issue)),
    );
    assert.ok(
      result.issues.some((issue) => /has no consequences section/u.test(issue)),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
