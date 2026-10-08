/**
 * @description Reads back a GitHub draft, its tag and its uploaded npm archive digest.
 */
export class ReleaseDraftVerifier {
  /** @description GitHub API read capability. @type {typeof fetch} */
  #fetch;

  /** @description GitHub repository API root. @type {string} */
  #githubApi;

  /** @description Token with permission to read draft releases. @type {string} */
  #token;

  /**
   * @description Creates a verifier for one repository.
   * @param {{ repository: string, token: string, fetchResponse: typeof fetch }} options - GitHub read capabilities.
   */
  constructor(options) {
    if (!/^[\w-]+\/[\w-]+$/u.test(options.repository) || !options.token) {
      throw new Error("Draft verification requires a repository and authenticated token.");
    }
    this.#githubApi = `https://api.github.com/repos/${options.repository}`;
    this.#token = options.token;
    this.#fetch = options.fetchResponse;
  }

  /**
   * @description Confirms the exact draft, source tag, notes and single uploaded asset.
   * @param {unknown} value - Approved release intent.
   * @returns {Promise<string>} GitHub draft URL.
   */
  async verify(value) {
    const intent = this.#object(value, "release intent");
    const tag = this.#string(intent.tag, "approved tag");
    const sourceCommit = this.#string(intent.sourceCommit, "approved source commit");
    const title = this.#string(intent.title, "approved title");
    const body = this.#string(intent.body, "approved body");
    const archiveName = this.#string(intent.archiveName, "approved archive name");
    const sha256 = this.#string(intent.sha256, "approved SHA-256");

    const reference = this.#object(await this.#json(`${this.#githubApi}/git/ref/tags/${tag}`), "Git tag");
    const target = this.#object(reference.object, "Git tag target");
    if (target.type !== "commit" || target.sha !== sourceCommit) {
      throw new Error("The Git tag does not target the approved source commit.");
    }

    for (let page = 1; page <= 20; page += 1) {
      const releases = this.#array(
        await this.#json(`${this.#githubApi}/releases?per_page=100&page=${page}`),
        "GitHub releases",
      );
      const release = releases.map((item) => this.#object(item, "GitHub Release"))
        .find((item) => item.tag_name === tag);
      if (release !== undefined) {
        if (
          release.draft !== true || release.prerelease !== false ||
          release.name !== title ||
          this.#string(release.body, "draft notes").trimEnd() !== body.trimEnd()
        ) {
          throw new Error("The GitHub draft classification, title or notes differ from approval.");
        }
        const assets = this.#array(release.assets, "draft assets");
        if (assets.length !== 1) {
          throw new Error("The GitHub draft must contain exactly one package archive.");
        }
        const asset = this.#object(assets[0], "draft asset");
        if (
          asset.name !== archiveName || asset.state !== "uploaded" ||
          asset.digest !== `sha256:${sha256.toLowerCase()}`
        ) {
          throw new Error("The GitHub draft archive differs from the approved npm archive.");
        }
        return this.#string(release.html_url, "draft URL");
      }
      if (releases.length < 100) {
        break;
      }
    }
    throw new Error(`The GitHub draft is not visible for ${tag}.`);
  }

  /**
   * @description Reads one GitHub API JSON resource.
   * @param {string} url - Repository API URL.
   * @returns {Promise<unknown>} Parsed response.
   */
  async #json(url) {
    const response = await this.#fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.#token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "aster-release-draft-verification",
      },
      signal: AbortSignal.timeout(20_000),
      redirect: "error",
    });
    if (!response.ok) {
      throw new Error(`GitHub draft inspection failed: HTTP ${response.status}.`);
    }
    return response.json();
  }

  /**
   * @description Requires an ordinary JSON object.
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
   * @description Requires an array.
   * @param {unknown} value - Untrusted value.
   * @param {string} label - Diagnostic label.
   * @returns {unknown[]} Array value.
   */
  #array(value, label) {
    if (!Array.isArray(value)) {
      throw new Error(`Expected ${label} to be an array.`);
    }
    return value;
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
