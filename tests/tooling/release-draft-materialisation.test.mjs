import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ReleaseDraftMaterialiser } from "../../tooling/release/runtime/release-draft.materialiser.mjs";
import { releaseApprovalDigest } from "../../tooling/release/runtime/release-approval.digest.mjs";

const archive = Buffer.from("published package bytes");
const sha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();
const sourceCommit = "e5b83299bd755f61fd17dae4769ef10b4f15c22c";
const approvedFields = {
  sourceCommit,
  sha256,
  tag: "core/v0.1.0",
  title: "Aster Core 0.1.0",
  body: "Published Core notes.",
  archiveName: "luscious-garden-aster-core-0.1.0.tgz",
  archiveUrl: "https://registry.npmjs.org/@luscious-garden/aster-core/-/aster-core-0.1.0.tgz",
  draftInspection: "complete",
};
const intent = Object.freeze({ ...approvedFields, approvalSha256: releaseApprovalDigest(approvedFields) });

test("writes only verified notes and npm-identical archive bytes", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-draft-"));
  try {
    const materialiser = new ReleaseDraftMaterialiser(async () => new Response(archive));
    const files = await materialiser.materialise(intent, sourceCommit, sha256, intent.approvalSha256, join(root, "output"));
    assert.equal(files.tag, intent.tag);
    assert.equal(await readFile(files.notesPath, "utf8"), `${intent.body}\n`);
    assert.deepEqual(await readFile(files.archivePath), archive);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects uninspected drafts or changed human approval before downloading", async () => {
  let requests = 0;
  const materialiser = new ReleaseDraftMaterialiser(async () => {
    requests += 1;
    return new Response(archive);
  });
  const output = join(tmpdir(), "unused-aster-draft-output");

  await assert.rejects(materialiser.materialise({ ...intent, draftInspection: "not-visible" }, sourceCommit, sha256, intent.approvalSha256, output), /not inspected/u);
  await assert.rejects(materialiser.materialise(intent, "0".repeat(40), sha256, intent.approvalSha256, output), /differs from human approval/u);
  await assert.rejects(materialiser.materialise(intent, sourceCommit, "0".repeat(64), intent.approvalSha256, output), /differs from human approval/u);
  await assert.rejects(materialiser.materialise(intent, sourceCommit, sha256, "0".repeat(64), output), /title, notes or asset identity differs/u);
  await assert.rejects(materialiser.materialise({ ...intent, title: "Changed title" }, sourceCommit, sha256, intent.approvalSha256, output), /title, notes or asset identity differs/u);
  await assert.rejects(materialiser.materialise({ ...intent, tag: "icons/v0.1.0" }, sourceCommit, sha256, intent.approvalSha256, output), /title, notes or asset identity differs/u);
  assert.equal(requests, 0);
});

test("rejects an archive changed after preparation without writing files", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-draft-"));
  try {
    const materialiser = new ReleaseDraftMaterialiser(async () => new Response("different bytes"));
    await assert.rejects(materialiser.materialise(intent, sourceCommit, sha256, intent.approvalSha256, join(root, "output")), /differs from the approved npm bytes/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
