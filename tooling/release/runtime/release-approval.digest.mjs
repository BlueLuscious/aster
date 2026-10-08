import { createHash } from "node:crypto";

/**
 * @description Hashes the exact package-specific content subject to human draft approval.
 * @param {{ tag: string, title: string, body: string, sourceCommit: string, archiveName: string, archiveUrl: string, sha256: string }} intent - Reviewed release fields.
 * @returns {string} Uppercase SHA-256 of the stable approval projection.
 */
export function releaseApprovalDigest(intent) {
  const approved = {
    tag: intent.tag,
    title: intent.title,
    body: intent.body,
    sourceCommit: intent.sourceCommit,
    archiveName: intent.archiveName,
    archiveUrl: intent.archiveUrl,
    sha256: intent.sha256,
  };
  return createHash("sha256").update(JSON.stringify(approved)).digest("hex").toUpperCase();
}
