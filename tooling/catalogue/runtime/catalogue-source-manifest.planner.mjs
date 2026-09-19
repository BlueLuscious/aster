import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Plans one complete metadata-only distribution manifest from validated sources.
 */
export class CatalogueSourceManifestPlanner {
  /** @description Deterministic generated source serialiser. */
  #serialiser;

  /** @description Repository path composition capability. */
  #paths;

  /** @description Shared canonical distribution-key serialiser. */
  #keys;

  /** @description Package-relative generated manifest output path. */
  #manifestPath;

  /**
   * @description Creates one metadata-only distribution manifest planner.
   * @param {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser} serialiser - Generated source serialiser.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("./catalogue-source-key.serialiser.mjs").CatalogueSourceKeySerialiser} keys - Canonical distribution-key serialiser.
   * @param {string} manifestPath - Package-relative generated manifest output path.
   */
  constructor(serialiser, paths, keys, manifestPath) {
    this.#serialiser = serialiser;
    this.#paths = paths;
    this.#keys = keys;
    this.#manifestPath = manifestPath;
  }

  /**
   * @description Plans canonically ordered icon and collection manifest records.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]} inspections - Complete validated family inspections.
   * @returns {import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput} Generated manifest output.
   */
  plan(packageRoot, inspections) {
    const icons = inspections
      .filter(({ family }) => family.kind === catalogueSourceFamilyKinds.icon)
      .flatMap(({ modules }) => modules);
    const collections = inspections
      .filter(({ family }) => family.kind === catalogueSourceFamilyKinds.collection)
      .flatMap(({ modules }) => modules);
    const iconsByPath = new Map(
      icons.map((module) => [this.#paths.resolve(module.sourcePath), module]),
    );
    const iconRecords = icons
      .map((module) => Object.freeze({
        key: this.#keys.serialise(
          catalogueSourceFamilyKinds.icon,
          module.manifest.identity,
        ),
        symbol: module.symbol,
        ...module.manifest,
      }))
      .sort((left, right) => this.#compareText(left.key, right.key));
    const collectionRecords = collections
      .map((module) => Object.freeze({
        key: this.#keys.serialise(
          catalogueSourceFamilyKinds.collection,
          module.manifest.identity,
        ),
        symbol: module.symbol,
        ...module.manifest,
        members: Object.freeze(
          module.memberReferences.map((reference) => {
            const targetPath = this.#paths.resolve(
              this.#paths.dirname(module.sourcePath),
              reference.moduleSpecifier.replace(/\.js$/u, ".ts"),
            );
            const target = iconsByPath.get(targetPath);

            if (target === undefined) {
              throw new CatalogueSourceError(
                `${module.sourcePath} contains unresolved manifest member ${reference.moduleSpecifier}.`,
              );
            }

            return this.#keys.serialise(
              catalogueSourceFamilyKinds.icon,
              target.manifest.identity,
            );
          }),
        ),
      }))
      .sort((left, right) => this.#compareText(left.key, right.key));

    return Object.freeze({
      path: this.#paths.resolve(packageRoot, this.#manifestPath),
      relativePath: this.#manifestPath,
      content: this.#serialiser.manifest(iconRecords, collectionRecords),
    });
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
