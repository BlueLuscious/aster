import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Coordinates recursive discovery and validation for canonical catalogue modules.
 */
export class CatalogueSourceModuleInspector {
  /**
   * @description Canonical source text acquisition capability.
   * @type {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem}
   */
  #fileSystem;

  /**
   * @description Deterministic recursive file traversal capability.
   * @type {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker}
   */
  #files;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Canonical source-layout normalisation authority.
   * @type {import("./catalogue-source-layout.normaliser.mjs").CatalogueSourceLayoutNormaliser}
   */
  #layouts;

  /**
   * @description Canonical TypeScript source inspection authority.
   * @type {import("./catalogue-source-syntax.inspector.mjs").CatalogueSourceSyntaxInspector}
   */
  #syntax;

  /**
   * @description Creates one canonical source-module discovery coordinator.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Source acquisition capability.
   * @param {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker} files - Deterministic recursive source traversal capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("./catalogue-source-layout.normaliser.mjs").CatalogueSourceLayoutNormaliser} layouts - Canonical source-layout normaliser.
   * @param {import("./catalogue-source-syntax.inspector.mjs").CatalogueSourceSyntaxInspector} syntax - Canonical TypeScript source inspector.
   */
  constructor(fileSystem, files, paths, layouts, syntax) {
    this.#fileSystem = fileSystem;
    this.#files = files;
    this.#paths = paths;
    this.#layouts = layouts;
    this.#syntax = syntax;
  }

  /**
   * @description Discovers one configured family and rejects identity or symbol ambiguity.
   * @param {string} packageRoot - Absolute package root.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Canonical source-family configuration.
   * @returns {Promise<readonly import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule[]>} Canonically ordered source modules.
   */
  async inspect(packageRoot, family) {
    const sourceRoot = this.#paths.resolve(packageRoot, family.sourceDirectory);
    const sourcePaths = [
      ...(await this.#files.collect(sourceRoot, (sourcePath) =>
        this.#acceptsSourcePath(sourceRoot, sourcePath, family),
      )),
    ].sort((left, right) =>
      this.#compareText(
        this.#paths.display(sourceRoot, left),
        this.#paths.display(sourceRoot, right),
      ),
    );
    const modules = [];
    const identities = new Set();
    const symbols = new Set();

    for (const sourcePath of sourcePaths) {
      const identity = this.#layouts.normalise(
        this.#paths.display(sourceRoot, sourcePath),
        family,
      );
      const identityKey = JSON.stringify([identity.name, identity.variant]);

      if (identities.has(identityKey)) {
        throw new CatalogueSourceError(
          `Duplicate canonical catalogue source identity: ${this.#displayIdentity(identity)}`,
        );
      }

      if (
        identity.symbol === family.authorityName ||
        symbols.has(identity.symbol)
      ) {
        throw new CatalogueSourceError(
          `Ambiguous canonical catalogue source symbol: ${identity.symbol}`,
        );
      }

      const source = await this.#fileSystem.readText(sourcePath);
      const memberReferences = this.#syntax.inspect(
        sourcePath,
        source,
        family,
        identity,
      );

      identities.add(identityKey);
      symbols.add(identity.symbol);
      modules.push(
        Object.freeze({
          name: identity.name,
          variant: identity.variant,
          symbol: identity.symbol,
          sourcePath,
          relativePath: this.#paths.display(packageRoot, sourcePath),
          memberReferences,
        }),
      );
    }

    if (modules.length === 0) {
      throw new CatalogueSourceError(
        `Catalogue source family contains no ${family.sourceSuffix} modules.`,
      );
    }

    return Object.freeze(
      modules.sort(
        (left, right) =>
          this.#compareText(left.name, right.name) ||
          this.#compareText(left.variant ?? "", right.variant ?? ""),
      ),
    );
  }

  /**
   * @description Selects canonical-role files while excluding reserved generated directories.
   * @param {string} sourceRoot - Absolute configured source-family root.
   * @param {string} sourcePath - Candidate absolute source path.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @returns {boolean} Whether the candidate belongs to canonical inspection.
   */
  #acceptsSourcePath(sourceRoot, sourcePath, family) {
    if (!sourcePath.endsWith(family.sourceSuffix)) {
      return false;
    }

    const relativePath = this.#paths.display(sourceRoot, sourcePath);

    return !family.excludedDirectories.some(
      (directory) =>
        relativePath === directory || relativePath.startsWith(`${directory}/`),
    );
  }

  /**
   * @description Presents one logical identity in stable diagnostic form.
   * @param {import("../contracts/internal/catalogue-source-identity.contract.mjs").ICatalogueSourceIdentity} identity - Logical identity to present.
   * @returns {string} Stable name and optional variant representation.
   */
  #displayIdentity(identity) {
    return identity.variant === undefined
      ? identity.name
      : `${identity.name}@${identity.variant}`;
  }

  /**
   * @description Compares canonical text without host locale dependence.
   * @param {string} left - First canonical text.
   * @param {string} right - Second canonical text.
   * @returns {number} Negative, zero or positive ordinal relation.
   */
  #compareText(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
