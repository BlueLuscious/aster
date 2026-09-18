import { posix } from "node:path";

import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Plans collision-free public definition facades independently from source layout.
 */
export class CatalogueSourceFacadePlanner {
  /** @description Deterministic generated facade source serialiser. */
  #serialiser;

  /** @description Repository path composition capability. */
  #paths;

  /** @description Icon names owned by exact or distinct package subpath families. */
  #reservedIconNames;

  /**
   * @description Creates one generated public facade planner.
   * @param {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser} serialiser - Generated source serialiser.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {readonly string[]} reservedIconNames - Icon names unavailable to ordinary icon subpaths.
   */
  constructor(serialiser, paths, reservedIconNames) {
    this.#serialiser = serialiser;
    this.#paths = paths;
    this.#reservedIconNames = new Set(reservedIconNames);
  }

  /**
   * @description Plans every public facade after rejecting reserved or ambiguous subpaths.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]} inspections - Complete validated family inspections.
   * @returns {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} Canonically ordered facade outputs.
   */
  plan(packageRoot, inspections) {
    const outputs = [];
    const publicSubpaths = new Set();

    for (const { family, modules } of inspections) {
      for (const module of modules) {
        if (
          family.kind === catalogueSourceFamilyKinds.icon
          && this.#reservedIconNames.has(module.name)
        ) {
          throw new CatalogueSourceError(
            `Canonical icon name collides with a reserved public subpath: ${module.name}`,
          );
        }

        const publicSubpath = this.#publicSubpath(family.kind, module);

        if (publicSubpaths.has(publicSubpath)) {
          throw new CatalogueSourceError(
            `Ambiguous generated catalogue public subpath: ${publicSubpath}`,
          );
        }

        publicSubpaths.add(publicSubpath);
        const relativePath = this.#facadePath(family, module);
        outputs.push(
          Object.freeze({
            path: this.#paths.resolve(packageRoot, relativePath),
            relativePath,
            content: this.#serialiser.facade(relativePath, module),
          }),
        );
      }
    }

    return Object.freeze(outputs);
  }

  /**
   * @description Resolves one logical definition to its package public subpath.
   * @param {"icon" | "collection"} familyKind - Semantic source-family discriminator.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} module - Validated source module.
   * @returns {string} Slash-separated public subpath.
   */
  #publicSubpath(familyKind, module) {
    if (familyKind === catalogueSourceFamilyKinds.collection) {
      return `collections/${module.name}`;
    }

    return module.variant === undefined
      ? module.name
      : `${module.name}/${module.variant}`;
  }

  /**
   * @description Resolves one logical definition to its generated TypeScript facade path.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} module - Validated source module.
   * @returns {string} Package-relative generated facade path.
   */
  #facadePath(family, module) {
    const suffix = module.variant === undefined
      ? `${module.name}.ts`
      : `${module.name}/${module.variant}.ts`;

    return posix.join(family.facadeDirectory, suffix);
  }
}
