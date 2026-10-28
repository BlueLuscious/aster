import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { repositoryEntryKinds } from "../../shared/constants/repository-entry-kinds.constant.mjs";
import { catalogueIconRemoval } from "../constants/catalogue-icon-removal.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Acquires exact, physically contained read-only inputs and hypothetical catalogue views.
 * @remarks Snapshots belong to one planning call. Rechecking detects observed changes; it is not a filesystem lock against hostile concurrent writers.
 */
export class CatalogueIconRemovalSource {
  /** @description Pinned lexical and physical workspace root. */
  #root;
  /**
   * @description Owned exact file-text snapshots indexed by absolute path.
   * @type {Map<string, string>}
   */
  #texts = new Map();
  /**
   * @description Owned directory snapshots indexed by absolute path.
   * @type {Map<string, readonly import("../../shared/contracts/internal/repository-directory-entry.contract.mjs").IRepositoryDirectoryEntry[]>}
   */
  #directories = new Map();
  /**
   * @description Paths acquired as absent during this inspection.
   * @type {Set<string>}
   */
  #absent = new Set();

  /**
   * @description Creates an independent read-only acquisition lifecycle.
   * @param {string} workspaceRoot - Explicit workspace containing the Icons package.
   */
  constructor(workspaceRoot) {
    this.#root = resolve(workspaceRoot);
  }

  /**
   * @description Presents one acquired absolute path relative to the pinned workspace.
   * @param {string} path - Contained path.
   * @returns {string} Portable relative path.
   */
  display(path) {
    return relative(this.#root, this.#contained(path)).split(sep).join("/");
  }

  /**
   * @description Creates a read-only producer capability with optional in-memory source edits/removal.
   * @param {readonly { path: string, after: string }[]} [edits] - Copied workspace-relative replacements.
   * @param {string} [removalPath] - Workspace-relative file hidden only in this view.
   * @returns {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} Borrowed producer capability; every mutation method rejects.
   */
  view(edits = [], removalPath) {
    const replacements = new Map(edits.map(({ path, after }) => [this.#contained(resolve(this.#root, path)), after]));
    const removed = removalPath === undefined ? undefined : this.#contained(resolve(this.#root, removalPath));
    const unavailable = (/** @type {string} */ path) => Object.assign(new CatalogueSourceError(`Source is absent in the proposed removal: ${this.display(path)}`), { code: "ENOENT" });
    const read = async (/** @type {string} */ path) => {
      const target = this.#contained(path);
      if (target === removed) {
        throw unavailable(target);
      }
      const original = await this.#read(target);
      return replacements.get(target) ?? original;
    };
    const refuse = async () => {
      throw new CatalogueSourceError("Icon removal preview cannot write files.");
    };
    /** @type {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} */
    const view = {
      exists: async (path) => {
        const target = this.#contained(path);
        if (target === removed) {
          return false;
        }
        const status = await this.#status(target);
        if (status === undefined) {
          this.#absent.add(target);
        }
        return status !== undefined;
      },
      entries: async (path) => Object.freeze((await this.#entries(this.#contained(path)))
        .filter((entry) => resolve(path, entry.name) !== removed)),
      readText: read,
      readTextIfPresent: async (path) => {
        if (this.#contained(path) === removed) {
          return undefined;
        }
        try {
          return await read(path);
        } catch (error) {
          if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            this.#absent.add(this.#contained(path));
            return undefined;
          }
          throw error;
        }
      },
      writeText: refuse,
      replaceDirectory: refuse,
      replaceText: refuse,
    };
    return Object.freeze(view);
  }

  /**
   * @description Acquires a finite authored tree without entering generated/dependency/output roots.
   * @param {string} relativeRoot - Workspace-relative directory or file.
   * @param {(path: string) => boolean} accepts - File selection predicate.
   * @returns {Promise<readonly string[]>} Deterministically ordered contained file paths.
   */
  async files(relativeRoot, accepts) {
    const root = this.#contained(resolve(this.#root, relativeRoot));
    const status = await this.#status(root);
    if (status === undefined) {
      this.#absent.add(root);
      return Object.freeze([]);
    }
    if (status.isFile()) {
      return Object.freeze(accepts(root) ? [root] : []);
    }
    const paths = [];
    for (const entry of await this.#entries(root)) {
      if (["node_modules", "dist", "generated", ".git", ".pnpm-store"].includes(entry.name)) {
        continue;
      }
      const path = resolve(root, entry.name);
      if (entry.kind === repositoryEntryKinds.directory) {
        paths.push(...await this.files(this.display(path), accepts));
      } else if (accepts(path)) {
        paths.push(path);
      }
    }
    return Object.freeze(paths);
  }

  /**
   * @description Returns immutable exact file preimages acquired so far.
   * @returns {readonly import("../contracts/internal/catalogue-icon-removal-input.contract.mjs").ICatalogueIconRemovalInput[]} Ordered workspace-relative preimages.
   */
  inputs() {
    return Object.freeze([...this.#texts.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([path, content]) => Object.freeze({ path: this.display(path), content })));
  }

  /**
   * @description Returns immutable acquired directory inventories.
   * @returns {readonly { path: string, entries: readonly string[] }[]} Ordered entry/kind snapshots.
   */
  inventories() {
    return Object.freeze([...this.#directories.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([path, entries]) => Object.freeze({
      path: this.display(path),
      entries: Object.freeze(entries.map((entry) => `${entry.kind}:${entry.name}`)),
    })));
  }

  /**
   * @description Returns paths observed absent, independently from virtual removal.
   * @returns {readonly string[]} Ordered workspace-relative absences.
   */
  absentPaths() {
    return Object.freeze([...this.#absent].sort().map((path) => this.display(path)));
  }

  /**
   * @description Rechecks physical boundaries, exact input bytes and acquired inventories before returning a plan.
   * @returns {Promise<void>} Completion only when the acquired state still agrees.
   */
  async verify() {
    for (const [path, expected] of this.#texts) {
      await this.#status(path);
      if (await this.#decode(path) !== expected) {
        throw new CatalogueSourceError(`Input changed during removal preview: ${this.display(path)}`);
      }
    }
    for (const [path, expected] of this.#directories) {
      if (JSON.stringify(await this.#readEntries(path)) !== JSON.stringify(expected)) {
        throw new CatalogueSourceError(`Directory changed during removal preview: ${this.display(path)}`);
      }
    }
    for (const path of this.#absent) {
      if (await this.#status(path) !== undefined) {
        throw new CatalogueSourceError(`Absent input appeared during removal preview: ${this.display(path)}`);
      }
    }
  }

  /**
   * @description Resolves a path without granting authority outside the workspace.
   * @param {string} path - Candidate path.
   * @returns {string} Contained absolute path.
   */
  #contained(path) {
    const target = resolve(path);
    const relation = relative(this.#root, target);
    if (isAbsolute(relation) || relation === ".." || relation.startsWith(`..${sep}`)) {
      throw new CatalogueSourceError(`Removal input escapes the workspace: ${path}`);
    }
    return target;
  }

  /**
   * @description Validates physical ancestors and regular single-link file ownership without following links.
   * @param {string} path - Contained candidate path.
   * @returns {Promise<import("node:fs").Stats | undefined>} Existing accepted status, or genuine absence.
   */
  async #status(path) {
    const target = this.#contained(path);
    let current = this.#root;
    const segments = relative(this.#root, target).split(sep).filter(Boolean);
    for (const segment of ["", ...segments]) {
      current = resolve(current, segment);
      let status;
      try {
        status = await lstat(current);
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
          return undefined;
        }
        throw error;
      }
      if (status.isSymbolicLink() || (!status.isFile() && !status.isDirectory()) || (status.isFile() && status.nlink !== 1)) {
        throw new CatalogueSourceError(`Removal input is linked or non-regular: ${this.display(current)}`);
      }
      if (await realpath(current) !== current) {
        throw new CatalogueSourceError(`Removal input has an aliased physical path: ${this.display(current)}`);
      }
      if (current === target) {
        return status;
      }
    }
    throw new CatalogueSourceError("Removal input status is unavailable.");
  }

  /**
   * @description Decodes exact UTF-8 bytes while retaining a BOM and rejecting lossy input.
   * @param {string} path - Physically checked regular file.
   * @returns {Promise<string>} Exact accepted text.
   */
  async #decode(path) {
    try {
      return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await readFile(path));
    } catch (error) {
      if (error instanceof TypeError) {
        throw new CatalogueSourceError(`Removal input is not valid UTF-8: ${this.display(path)}`);
      }
      throw error;
    }
  }

  /**
   * @description Acquires one immutable text preimage once per planning lifecycle.
   * @param {string} path - Contained absolute source/input path.
   * @returns {Promise<string>} Exact cached text.
   */
  async #read(path) {
    const cached = this.#texts.get(path);
    if (cached !== undefined) {
      return cached;
    }
    const status = await this.#status(path);
    if (status === undefined) {
      throw Object.assign(new CatalogueSourceError(`Missing removal input: ${this.display(path)}`), { code: "ENOENT" });
    }
    if (!status.isFile()) {
      throw new CatalogueSourceError(`Removal input must be a file: ${this.display(path)}`);
    }
    const text = await this.#decode(path);
    this.#texts.set(path, text);
    return text;
  }

  /**
   * @description Acquires ordered entry kinds and refuses interrupted or linked input trees.
   * @param {string} path - Contained directory.
   * @returns {Promise<readonly import("../../shared/contracts/internal/repository-directory-entry.contract.mjs").IRepositoryDirectoryEntry[]>} Accepted directory entries.
   */
  async #readEntries(path) {
    const status = await this.#status(path);
    if (!status?.isDirectory()) {
      throw new CatalogueSourceError(`Removal input must be a directory: ${this.display(path)}`);
    }
    const entries = (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    const names = new Set();
    return Object.freeze(entries.map((entry) => {
      if (names.has(entry.name.toLowerCase()) || entry.name === catalogueIconRemoval.lockName || entry.name.includes(catalogueIconRemoval.stageMarker)) {
        throw new CatalogueSourceError(`Ambiguous or interrupted removal entry: ${this.display(resolve(path, entry.name))}`);
      }
      names.add(entry.name.toLowerCase());
      if (!entry.isFile() && !entry.isDirectory()) {
        throw new CatalogueSourceError(`Linked or unsupported removal entry: ${this.display(resolve(path, entry.name))}`);
      }
      return Object.freeze({ name: entry.name, kind: entry.isDirectory() ? repositoryEntryKinds.directory : repositoryEntryKinds.file });
    }));
  }

  /**
   * @description Retains one directory snapshot for all original and hypothetical producer reads.
   * @param {string} path - Contained directory.
   * @returns {Promise<readonly import("../../shared/contracts/internal/repository-directory-entry.contract.mjs").IRepositoryDirectoryEntry[]>} Cached ordered entries.
   */
  async #entries(path) {
    const cached = this.#directories.get(path);
    if (cached !== undefined) {
      return cached;
    }
    const entries = await this.#readEntries(path);
    this.#directories.set(path, entries);
    return entries;
  }
}
