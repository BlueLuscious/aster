import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { releaseApprovalDigest } from "./release-approval.digest.mjs";

/**
 * @description Materialises only locally verified inputs for a human-approved GitHub draft.
 */
export class ReleaseDraftMaterialiser {
  /** @description npm archive read capability. @type {typeof fetch} */
  #fetch;

  /**
   * @description Creates a local draft-materialisation capability.
   * @param {typeof fetch} fetchResponse - npm archive acquisition capability.
   */
  constructor(fetchResponse) {
    this.#fetch = fetchResponse;
  }

  /**
   * @description Rechecks approved identifiers and writes only the npm-identical archive.
   * @param {unknown} value - Previously prepared release intent.
   * @param {string} approvedSource - Human-approved source commit.
   * @param {string} approvedSha256 - Human-approved archive SHA-256.
   * @param {string} approvedIntentSha256 - Human-approved digest of title, body and other release fields.
   * @param {string} outputDirectory - Runner-local output directory.
   * @returns {Promise<Readonly<{ tag: string, sourceCommit: string, archivePath: string }>>} Local draft inputs.
   */
  async materialise(
    value,
    approvedSource,
    approvedSha256,
    approvedIntentSha256,
    outputDirectory,
  ) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("Release intent must be an object.");
    }
    const intent = Object.fromEntries(Object.entries(value));
    const sourceCommit = this.#string(intent.sourceCommit, "source commit");
    const sha256 = this.#string(intent.sha256, "archive SHA-256");
    const archiveName = this.#string(intent.archiveName, "archive name");
    const archiveUrl = this.#string(intent.archiveUrl, "archive URL");
    const tag = this.#string(intent.tag, "tag");
    const title = this.#string(intent.title, "title");
    const body = this.#string(intent.body, "release notes");
    const intentSha256 = this.#string(
      intent.approvalSha256,
      "approval SHA-256",
    );
    if (intent.releasePreflight !== "authenticated") {
      throw new Error(
        "The release intent has not checked an authenticated release listing.",
      );
    }
    if (
      !/^[0-9a-f]{40}$/u.test(approvedSource) ||
      !/^[0-9A-Fa-f]{64}$/u.test(approvedSha256) ||
      sourceCommit !== approvedSource ||
      sha256 !== approvedSha256.toUpperCase()
    ) {
      throw new Error(
        "The source commit or archive hash differs from human approval.",
      );
    }
    if (
      !/^[0-9A-Fa-f]{64}$/u.test(approvedIntentSha256) ||
      intentSha256 !== approvedIntentSha256.toUpperCase() ||
      intentSha256 !==
        releaseApprovalDigest({
          tag,
          title,
          body,
          sourceCommit,
          archiveName,
          archiveUrl,
          sha256,
        })
    ) {
      throw new Error(
        "The release title, notes or asset identity differs from human approval.",
      );
    }
    const identity =
      /^(core|icons|svg|cli)\/v(\d+\.\d+\.\d+(?:-rc\.\d+)?)$/u.exec(tag);
    const slug = identity?.[1];
    const version = identity?.[2];
    const titleName =
      slug === "svg"
        ? "SVG"
        : slug === "cli"
          ? "CLI"
          : slug === undefined
            ? ""
            : slug.slice(0, 1).toUpperCase() + slug.slice(1);
    if (
      slug === undefined ||
      version === undefined ||
      archiveName !== `luscious-garden-aster-${slug}-${version}.tgz` ||
      title !== `Aster ${titleName} ${version}` ||
      new URL(archiveUrl).origin !== "https://registry.npmjs.org" ||
      !new URL(archiveUrl).pathname.endsWith(`/aster-${slug}-${version}.tgz`)
    ) {
      throw new Error(
        "The release intent contains an invalid package identity.",
      );
    }

    const response = await this.#fetch(archiveUrl, {
      signal: AbortSignal.timeout(20_000),
      redirect: "error",
    });
    if (!response.ok) {
      throw new Error(`npm archive request failed: HTTP ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > 25_000_000) {
      throw new Error("npm archive is empty or exceeds the draft size limit.");
    }
    const downloadedSha256 = createHash("sha256")
      .update(bytes)
      .digest("hex")
      .toUpperCase();
    if (downloadedSha256 !== sha256) {
      throw new Error("The draft archive differs from the approved npm bytes.");
    }

    await mkdir(outputDirectory, { recursive: true });
    const archivePath = join(outputDirectory, archiveName);
    await writeFile(archivePath, bytes, { flag: "wx" });
    return Object.freeze({ tag, sourceCommit, archivePath });
  }

  /**
   * @description Requires a non-empty string in the prepared intent.
   * @param {unknown} value - Untrusted intent value.
   * @param {string} label - Diagnostic label.
   * @returns {string} Required string.
   */
  #string(value, label) {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`Expected ${label} in the release intent.`);
    }
    return value;
  }
}
