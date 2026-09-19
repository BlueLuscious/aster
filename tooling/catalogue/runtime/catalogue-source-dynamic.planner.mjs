import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";

/**
 * @description Plans exact asynchronous definition loaders from validated catalogue sources.
 */
export class CatalogueSourceDynamicPlanner {
  /** @description Deterministic generated source serialiser. */
  #serialiser;

  /** @description Repository path composition capability. */
  #paths;

  /** @description Shared canonical distribution-key serialiser. */
  #keys;

  /** @description Generated public facade path authority. */
  #facades;

  /** @description Package-relative generated dynamic-loader output path. */
  #dynamicPath;

  /**
   * @description Creates one dynamic definition-loader planner.
   * @param {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser} serialiser - Generated source serialiser.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("./catalogue-source-key.serialiser.mjs").CatalogueSourceKeySerialiser} keys - Canonical distribution-key serialiser.
   * @param {import("./catalogue-source-facade.resolver.mjs").CatalogueSourceFacadeResolver} facades - Generated facade path authority.
   * @param {string} dynamicPath - Package-relative generated dynamic-loader output path.
   */
  constructor(serialiser, paths, keys, facades, dynamicPath) {
    this.#serialiser = serialiser;
    this.#paths = paths;
    this.#keys = keys;
    this.#facades = facades;
    this.#dynamicPath = dynamicPath;
  }

  /**
   * @description Plans canonically ordered icon and collection loader records.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]} inspections - Complete validated family inspections.
   * @returns {import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput} Generated dynamic-loader output.
   */
  plan(packageRoot, inspections) {
    const icons = [];
    const collections = [];

    for (const { family, modules } of inspections) {
      const records = family.kind === catalogueSourceFamilyKinds.icon
        ? icons
        : collections;

      for (const module of modules) {
        records.push(Object.freeze({
          key: this.#keys.serialise(family.kind, module.manifest.identity),
          symbol: module.symbol,
          facadePath: this.#facades.path(family, module),
        }));
      }
    }

    icons.sort((left, right) => this.#compareText(left.key, right.key));
    collections.sort((left, right) => this.#compareText(left.key, right.key));

    return Object.freeze({
      path: this.#paths.resolve(packageRoot, this.#dynamicPath),
      relativePath: this.#dynamicPath,
      content: this.#serialiser.dynamic(
        this.#dynamicPath,
        Object.freeze(icons),
        Object.freeze(collections),
      ),
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
