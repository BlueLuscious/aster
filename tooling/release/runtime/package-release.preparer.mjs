import { createHash } from "node:crypto";
import { posix, resolve } from "node:path";

import { releaseApprovalDigest } from "./release-approval.digest.mjs";

/**
 * @description Verifies one published package and prepares its GitHub Release without public writes.
 */
export class PackageReleasePreparer {
  /** @description Root of the reviewed repository. @type {string} */
  #workspaceRoot;

  /** @description Read-only Git command capability. @type {(...args: string[]) => Promise<string>} */
  #git;

  /** @description Local documentation acquisition capability. @type {(path: string) => Promise<string>} */
  #readText;

  /** @description Remote read capability. @type {typeof fetch} */
  #fetch;

  /** @description Token used for authenticated GitHub release checks. @type {string} */
  #githubToken;

  /** @description Whether this run must check the authenticated release listing. @type {boolean} */
  #checkReleaseListing;

  /**
   * @description Creates an independently configured release preparer.
   * @param {{ workspaceRoot: string, git: (...args: string[]) => Promise<string>, readText: (path: string) => Promise<string>, fetchResponse: typeof fetch, githubToken: string, checkReleaseListing?: boolean }} options - Read-only repository and network capabilities.
   */
  constructor(options) {
    if (options.checkReleaseListing && !options.githubToken) {
      throw new Error("Authenticated release listing requires a GitHub token.");
    }

    this.#workspaceRoot = options.workspaceRoot;
    this.#git = options.git;
    this.#readText = options.readText;
    this.#fetch = options.fetchResponse;
    this.#githubToken = options.githubToken;
    this.#checkReleaseListing = options.checkReleaseListing ?? false;
  }

  /**
   * @description Checks canonical notes, source, npm bytes and GitHub state for one package version.
   * @param {string} slug - Public package directory name.
   * @param {string} version - Exact published package version.
   * @returns {Promise<Readonly<{ packageName: string, version: string, tag: string, title: string, body: string, sourceCommit: string, archiveName: string, archiveUrl: string, sha256: string, dependencies: Readonly<Record<string, string>>, ciUrl: string, releasePreflight: "authenticated" | "public", approvalSha256: string }>>} Reviewable release intent.
   */
  async prepare(slug, version) {
    if (!["core", "icons", "svg", "cli"].includes(slug)) {
      throw new Error(`Unsupported public package: ${slug}`);
    }
    if (!/^\d+\.\d+\.\d+(?:-rc\.\d+)?$/u.test(version)) {
      throw new Error(`Invalid package version: ${version}`);
    }

    const notePath = `docs/en/packages/${slug}/releases/${version}.md`;
    const notes = this.#parseNotes(
      await this.#readText(resolve(this.#workspaceRoot, notePath)),
      slug,
      version,
    );
    const sourceCommit = notes.sourceCommit;
    const sourceType = (await this.#git("cat-file", "-t", sourceCommit)).trim();
    if (sourceType !== "commit") {
      throw new Error(`Release source is not a commit: ${sourceCommit}`);
    }
    await this.#git("merge-base", "--is-ancestor", sourceCommit, "master");

    const rootManifest = this.#object(
      JSON.parse(await this.#git("show", `${sourceCommit}:package.json`)),
      "source root manifest",
    );
    const repository = this.#object(
      rootManifest.repository,
      "source repository",
    );
    const repositoryUrl = this.#string(
      repository.url,
      "source repository URL",
    ).replace(/^git\+/u, "");
    const githubUrl = new URL(repositoryUrl);
    const repositoryPath = githubUrl.pathname
      .replace(/^\//u, "")
      .replace(/\.git$/u, "");
    if (
      githubUrl.protocol !== "https:" ||
      githubUrl.hostname !== "github.com" ||
      !/^[\w-]+\/[\w-]+$/u.test(repositoryPath)
    ) {
      throw new Error(
        "The source manifest must identify one GitHub repository.",
      );
    }

    const manifest = this.#object(
      JSON.parse(
        await this.#git(
          "show",
          `${sourceCommit}:packages/${slug}/package.json`,
        ),
      ),
      "source package manifest",
    );
    const packageName = this.#string(manifest.name, "source package name");
    if (
      packageName !== `@luscious-garden/aster-${slug}` ||
      manifest.version !== version
    ) {
      throw new Error(`The source manifest does not match ${slug}@${version}.`);
    }

    const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;
    const registry = this.#object(
      await this.#json(registryUrl, false),
      "npm version metadata",
    );
    if (registry.name !== packageName || registry.version !== version) {
      throw new Error(
        "npm metadata does not match the selected package version.",
      );
    }
    const dist = this.#object(registry.dist, "npm distribution metadata");
    const archiveUrl = this.#string(dist.tarball, "npm tarball URL");
    const archiveLocation = new URL(archiveUrl);
    if (
      archiveLocation.protocol !== "https:" ||
      archiveLocation.hostname !== "registry.npmjs.org" ||
      !archiveLocation.pathname.endsWith(`/aster-${slug}-${version}.tgz`)
    ) {
      throw new Error("npm metadata points to an unexpected archive location.");
    }
    const dependencies = this.#dependencies(registry.dependencies);
    const sourceDependencies = this.#dependencies(manifest.dependencies);
    if (
      Object.keys(dependencies).sort().join("\n") !==
      Object.keys(sourceDependencies).sort().join("\n")
    ) {
      throw new Error(
        "npm runtime dependency names differ from the approved source.",
      );
    }

    const archive = await this.#request(archiveUrl, false);
    if (!archive.ok) {
      throw new Error(`npm archive request failed: HTTP ${archive.status}`);
    }
    const bytes = await archive.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > 25_000_000) {
      throw new Error(
        "npm archive is empty or exceeds the preparation size limit.",
      );
    }
    const sha256 = createHash("sha256")
      .update(Buffer.from(bytes))
      .digest("hex")
      .toUpperCase();
    if (sha256 !== notes.sha256) {
      throw new Error(
        `npm archive SHA-256 differs from the approved notes for ${packageName}@${version}.`,
      );
    }

    const githubApi = `https://api.github.com/repos/${repositoryPath}`;
    const ciUrl = await this.#verifyCi(githubApi, sourceCommit);
    const tag = `${slug}/v${version}`;
    await this.#requireAbsent(`${githubApi}/git/ref/tags/${tag}`, "Git tag");
    await this.#requireAbsent(
      `${githubApi}/releases/tags/${encodeURIComponent(tag)}`,
      "Visible GitHub Release",
    );
    if (this.#checkReleaseListing) {
      await this.#requireNoVisibleRelease(githubApi, tag);
    }

    /** @type {"authenticated" | "public"} */
    const releasePreflight = this.#checkReleaseListing
      ? "authenticated"
      : "public";
    const intent = {
      packageName,
      version,
      tag,
      title: notes.title,
      body: this.#absoluteLinks(notes.body, notePath, repositoryPath),
      sourceCommit,
      archiveName: `${packageName.slice(1).replaceAll("/", "-")}-${version}.tgz`,
      archiveUrl,
      sha256,
      dependencies: Object.freeze(dependencies),
      ciUrl,
      releasePreflight,
    };
    return Object.freeze({
      ...intent,
      approvalSha256: releaseApprovalDigest(intent),
    });
  }

  /**
   * @description Rejects matching releases visible to the authenticated GitHub API listing.
   * @param {string} githubApi - Repository API root.
   * @param {string} tag - Proposed package tag.
   * @returns {Promise<void>} Completion when the listing contains no matching release.
   */
  async #requireNoVisibleRelease(githubApi, tag) {
    for (let page = 1; page <= 20; page += 1) {
      const releases = this.#array(
        await this.#json(
          `${githubApi}/releases?per_page=100&page=${page}`,
          true,
        ),
        "GitHub releases",
      );
      if (
        releases.some(
          (release) =>
            this.#string(
              this.#object(release, "GitHub Release").tag_name,
              "GitHub Release tag",
            ) === tag,
        )
      ) {
        throw new Error(
          `A visible GitHub Release or draft already exists for ${tag}.`,
        );
      }
      if (releases.length < 100) {
        return;
      }
    }
    throw new Error(
      "GitHub release listing exceeds the supported inspection window.",
    );
  }

  /**
   * @description Extracts the release identity and approved evidence from one canonical page.
   * @param {string} markdown - Canonical package version page.
   * @param {string} slug - Selected package.
   * @param {string} version - Selected version.
   * @returns {{ title: string, body: string, sourceCommit: string, sha256: string }} Parsed notes.
   */
  #parseNotes(markdown, slug, version) {
    const title = /^# (.+)\r?\n/u.exec(markdown)?.[1];
    const sourceCommit = /^Source commit: `([0-9a-f]{40})`\.$/mu.exec(
      markdown,
    )?.[1];
    const sha256 = /^Approved archive SHA-256: `([0-9a-fA-F]{64})`\.$/mu.exec(
      markdown,
    )?.[1];
    const body = markdown.slice(markdown.indexOf("\n") + 1).trim();
    if (
      title?.toLowerCase() !== `aster ${slug} ${version}` ||
      sourceCommit === undefined ||
      sha256 === undefined ||
      !/^Status: \*\*Published /mu.test(body)
    ) {
      throw new Error(
        `Incomplete canonical release notes for ${slug}@${version}.`,
      );
    }
    return { title, body, sourceCommit, sha256: sha256.toUpperCase() };
  }

  /**
   * @description Rewrites local note links to their future canonical GitHub documentation URLs.
   * @param {string} body - Release body with documentation-relative links.
   * @param {string} notePath - Repository-relative canonical note path.
   * @param {string} repository - GitHub owner and repository.
   * @returns {string} Release body with absolute source-document links.
   */
  #absoluteLinks(body, notePath, repository) {
    return body.replace(/\]\(([^)]+)\)/gu, (match, target) => {
      if (/^(?:https?:|mailto:|#)/u.test(target)) {
        return match;
      }
      const [path, fragment] = target.split("#", 2);
      const resolved = posix.normalize(
        posix.join(posix.dirname(notePath), path),
      );
      if (
        resolved.startsWith("../") ||
        !/^(?:docs|packages)\//u.test(resolved)
      ) {
        throw new Error(
          `Release notes link outside canonical sources: ${target}`,
        );
      }
      return `](https://github.com/${repository}/blob/master/${resolved}${fragment === undefined ? "" : `#${fragment}`})`;
    });
  }

  /**
   * @description Requires the approved source's push workflow and both platform jobs to have passed.
   * @param {string} githubApi - Repository API root.
   * @param {string} sourceCommit - Approved source revision.
   * @returns {Promise<string>} Successful workflow run URL.
   */
  async #verifyCi(githubApi, sourceCommit) {
    const runs = this.#object(
      await this.#json(
        `${githubApi}/actions/workflows/ci.yaml/runs?head_sha=${sourceCommit}&event=push&branch=master&per_page=100`,
        true,
      ),
      "CI workflow runs",
    );
    const matching = this.#array(runs.workflow_runs, "CI workflow runs")
      .map((value) => this.#object(value, "CI workflow run"))
      .filter(
        (run) =>
          run.head_sha === sourceCommit &&
          run.head_branch === "master" &&
          run.event === "push",
      );
    const run = matching.at(0);
    if (run === undefined || run.conclusion !== "success") {
      throw new Error(
        `The approved source lacks a successful master push CI run: ${sourceCommit}.`,
      );
    }
    const jobsUrl = this.#string(run.jobs_url, "CI jobs URL");
    if (
      !jobsUrl.startsWith(`${githubApi}/actions/runs/`) ||
      new URL(jobsUrl).origin !== "https://api.github.com"
    ) {
      throw new Error(
        "CI job URL does not belong to the selected GitHub repository.",
      );
    }
    const jobs = this.#object(
      await this.#json(`${jobsUrl}?per_page=100`, true),
      "CI jobs",
    );
    const entries = this.#array(jobs.jobs, "CI jobs").map((value) =>
      this.#object(value, "CI job"),
    );
    if (
      typeof jobs.total_count !== "number" ||
      jobs.total_count > entries.length
    ) {
      throw new Error("CI job list is incomplete.");
    }
    for (const platform of ["ubuntu-latest", "windows-latest"]) {
      if (
        !entries.some(
          (job) =>
            job.name === `Verify repository (${platform})` &&
            job.conclusion === "success",
        )
      ) {
        throw new Error(
          `The ${platform} CI job did not pass for ${sourceCommit}.`,
        );
      }
    }
    return this.#string(run.html_url, "CI workflow URL");
  }

  /**
   * @description Rejects Git references or releases visible through a direct API request.
   * @param {string} url - GitHub API resource URL.
   * @param {string} label - Resource being checked.
   * @returns {Promise<void>} Completion when the resource does not exist.
   */
  async #requireAbsent(url, label) {
    const response = await this.#request(url, true);
    if (response.status === 404) {
      return;
    }
    if (response.ok) {
      throw new Error(`${label} already exists; inspect it before proceeding.`);
    }
    throw new Error(`${label} inspection failed: HTTP ${response.status}`);
  }

  /**
   * @description Acquires a JSON resource with an explicit success requirement.
   * @param {string} url - Registry or GitHub API URL.
   * @param {boolean} github - Whether to attach GitHub read credentials.
   * @returns {Promise<unknown>} Parsed JSON payload.
   */
  async #json(url, github) {
    const response = await this.#request(url, github);
    if (!response.ok) {
      throw new Error(
        `Release evidence request failed: HTTP ${response.status} at ${url}`,
      );
    }
    return response.json();
  }

  /**
   * @description Sends a bounded-time read request without forwarding GitHub credentials to npm.
   * @param {string} url - Exact evidence URL.
   * @param {boolean} github - Whether the endpoint belongs to GitHub.
   * @returns {Promise<Response>} HTTP response.
   */
  #request(url, github) {
    if (github && new URL(url).origin !== "https://api.github.com") {
      throw new Error(
        "GitHub credentials cannot be sent outside the GitHub API.",
      );
    }
    return this.#fetch(url, {
      headers: github
        ? {
            Accept: "application/vnd.github+json",
            ...(this.#githubToken
              ? { Authorization: `Bearer ${this.#githubToken}` }
              : {}),
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "aster-release-preparation",
          }
        : { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
  }

  /**
   * @description Requires an ordinary JSON object.
   * @param {unknown} value - Untrusted JSON value.
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
   * @description Requires a non-empty string value.
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

  /**
   * @description Requires a JSON array without accepting object-shaped substitutes.
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
   * @description Reads a manifest's direct runtime dependency map.
   * @param {unknown} value - Optional untrusted dependency map.
   * @returns {Record<string, string>} Direct runtime dependencies.
   */
  #dependencies(value) {
    if (value === undefined) {
      return {};
    }
    const record = this.#object(value, "runtime dependencies");
    /** @type {Record<string, string>} */
    const dependencies = {};
    for (const [name, range] of Object.entries(record)) {
      dependencies[name] = this.#string(range, `runtime dependency ${name}`);
    }
    return dependencies;
  }
}
