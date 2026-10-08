import { createHash } from "node:crypto";

import { releaseApprovalDigest } from "./release-approval.digest.mjs";

/**
 * @description Creates one approved draft and uploads its npm-identical archive through GitHub's release API.
 */
export class ReleaseDraftCreator {
  /** @description Repository API root. @type {string} */
  #githubApi;

  /** @description Repository upload API root. @type {string} */
  #uploadApi;

  /** @description Authenticated GitHub request capability. @type {typeof fetch} */
  #fetch;

  /** @description Token with repository content write access. @type {string} */
  #token;

  /**
   * @description Creates a draft-only GitHub release capability for one repository.
   * @param {{ repository: string, token: string, fetchResponse: typeof fetch }} options - GitHub write capabilities.
   */
  constructor(options) {
    if (!/^[\w-]+\/[\w-]+$/u.test(options.repository) || !options.token) {
      throw new Error(
        "Draft creation requires a repository and authenticated token.",
      );
    }
    this.#githubApi = `https://api.github.com/repos/${options.repository}`;
    this.#uploadApi = `https://uploads.github.com/repos/${options.repository}/releases`;
    this.#fetch = options.fetchResponse;
    this.#token = options.token;
  }

  /**
   * @description Creates a new draft against the already approved Git tag without updating an existing Release.
   * @param {unknown} value - Approved release intent.
   * @param {Uint8Array} archive - npm-identical archive bytes.
   * @returns {Promise<Readonly<{ id: number, uploadUrl: string }>>} Created draft identity and its upload endpoint.
   */
  async createDraft(value, archive) {
    const intent = this.#intent(value, archive);
    const tagResponse = await this.#request(
      `${this.#githubApi}/git/ref/tags/${intent.tag}`,
      "GET",
    );
    if (!tagResponse.ok) {
      throw new Error(
        `Approved Git tag inspection failed: HTTP ${tagResponse.status}.`,
      );
    }
    const reference = this.#object(await tagResponse.json(), "Git tag");
    const target = this.#object(reference.object, "Git tag target");
    if (
      reference.ref !== `refs/tags/${intent.tag}` ||
      target.type !== "commit" ||
      target.sha !== intent.sourceCommit
    ) {
      throw new Error(
        "The Git tag does not target the approved source commit.",
      );
    }

    const response = await this.#request(
      `${this.#githubApi}/releases`,
      "POST",
      {
        tag_name: intent.tag,
        name: intent.title,
        body: intent.body,
        draft: true,
        prerelease: false,
        generate_release_notes: false,
      },
    );
    if (response.status !== 201) {
      throw new Error(
        `GitHub draft creation failed: HTTP ${response.status}; inspect the tag and Releases before retrying.`,
      );
    }
    const release = this.#object(await response.json(), "created draft");
    const id = release.id;
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
      throw new Error("GitHub did not return a valid draft ID.");
    }
    if (
      release.tag_name !== intent.tag ||
      release.name !== intent.title ||
      this.#string(release.body, "draft notes").trimEnd() !==
        intent.body.trimEnd() ||
      release.draft !== true ||
      release.prerelease !== false
    ) {
      throw new Error(
        "The created draft does not match the approved identity or classification.",
      );
    }
    const uploadUrl = this.#string(release.upload_url, "draft upload URL");
    if (
      uploadUrl.toLowerCase() !==
      `${this.#uploadApi}/${id}/assets{?name,label}`.toLowerCase()
    ) {
      throw new Error(
        "The draft upload URL does not belong to the selected repository and release.",
      );
    }
    return Object.freeze({ id, uploadUrl });
  }

  /**
   * @description Uploads exactly one approved archive to the draft returned by creation.
   * @param {unknown} value - Approved release intent.
   * @param {Readonly<{ id: number, uploadUrl: string }>} draft - Created draft identity.
   * @param {Uint8Array} archive - npm-identical archive bytes.
   * @returns {Promise<void>} Completion when GitHub confirms the approved asset digest.
   */
  async uploadArchive(value, draft, archive) {
    const intent = this.#intent(value, archive);
    if (
      !Number.isSafeInteger(draft.id) ||
      draft.id <= 0 ||
      typeof draft.uploadUrl !== "string"
    ) {
      throw new Error("The created draft has an invalid upload identity.");
    }
    const baseUrl = `${this.#uploadApi}/${draft.id}/assets{?name,label}`;
    if (draft.uploadUrl.toLowerCase() !== baseUrl.toLowerCase()) {
      throw new Error("The draft upload URL changed after creation.");
    }
    const url = `${this.#uploadApi}/${draft.id}/assets?name=${encodeURIComponent(intent.archiveName)}`;
    const response = await this.#request(url, "POST", archive);
    if (response.status !== 201) {
      throw new Error(
        `GitHub archive upload failed: HTTP ${response.status}; inspect the partial draft.`,
      );
    }
    const asset = this.#object(await response.json(), "uploaded draft asset");
    if (
      asset.name !== intent.archiveName ||
      asset.state !== "uploaded" ||
      asset.size !== archive.byteLength ||
      asset.digest !== `sha256:${intent.sha256.toLowerCase()}`
    ) {
      throw new Error(
        "The uploaded draft asset differs from the approved npm archive.",
      );
    }
  }

  /**
   * @description Validates the immutable approval and exact archive bytes before any write.
   * @param {unknown} value - Untrusted release intent.
   * @param {Uint8Array} archive - Proposed archive bytes.
   * @returns {{ tag: string, title: string, body: string, sourceCommit: string, archiveName: string, archiveUrl: string, sha256: string }} Validated approval fields.
   */
  #intent(value, archive) {
    const record = this.#object(value, "release intent");
    if (
      !(archive instanceof Uint8Array) ||
      archive.byteLength === 0 ||
      archive.byteLength > 25_000_000
    ) {
      throw new Error(
        "The draft archive is empty or exceeds the supported size limit.",
      );
    }
    const intent = {
      tag: this.#string(record.tag, "approved tag"),
      title: this.#string(record.title, "approved title"),
      body: this.#string(record.body, "approved body"),
      sourceCommit: this.#string(record.sourceCommit, "approved source commit"),
      archiveName: this.#string(record.archiveName, "approved archive name"),
      archiveUrl: this.#string(record.archiveUrl, "approved archive URL"),
      sha256: this.#string(record.sha256, "approved SHA-256"),
    };
    if (
      record.releasePreflight !== "authenticated" ||
      !/^(core|icons|svg|cli)\/v\d+\.\d+\.\d+(?:-rc\.\d+)?$/u.test(
        intent.tag,
      ) ||
      !/^[0-9a-f]{40}$/u.test(intent.sourceCommit) ||
      !/^[0-9A-F]{64}$/u.test(intent.sha256) ||
      record.approvalSha256 !== releaseApprovalDigest(intent)
    ) {
      throw new Error("The release intent is not approved for draft creation.");
    }
    if (
      createHash("sha256").update(archive).digest("hex").toUpperCase() !==
      intent.sha256
    ) {
      throw new Error("The draft archive differs from the approved npm bytes.");
    }
    return intent;
  }

  /**
   * @description Sends one authenticated GitHub request without following redirects.
   * @param {string} url - Fixed GitHub API or upload URL.
   * @param {"GET" | "POST"} method - Read or create operation.
   * @param {object | Uint8Array} [body] - JSON release description or archive bytes.
   * @returns {Promise<Response>} GitHub response.
   */
  #request(url, method, body) {
    const isArchive = body instanceof Uint8Array;
    return this.#fetch(url, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.#token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "aster-release-draft-creation",
        ...(body === undefined
          ? {}
          : {
              "Content-Type": isArchive
                ? "application/octet-stream"
                : "application/json",
            }),
      },
      ...(body === undefined
        ? {}
        : { body: isArchive ? Buffer.from(body) : JSON.stringify(body) }),
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
  }

  /**
   * @description Requires a JSON object rather than another JSON value.
   * @param {unknown} value - Untrusted value.
   * @param {string} label - Diagnostic label.
   * @returns {Record<string, unknown>} Object value.
   */
  #object(value, label) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error(`Expected ${label} to be an object.`);
    }
    return Object.fromEntries(Object.entries(value));
  }

  /**
   * @description Requires a non-empty string.
   * @param {unknown} value - Untrusted value.
   * @param {string} label - Diagnostic label.
   * @returns {string} String value.
   */
  #string(value, label) {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`Expected ${label} to be a non-empty string.`);
    }
    return value;
  }
}
