import { posix } from "node:path";

import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";

/**
 * @description Resolves stable public subpaths and generated facade paths for catalogue sources.
 */
export class CatalogueSourceFacadeResolver {
  /**
   * @description Resolves one logical definition to its package public subpath.
   * @param {"icon" | "collection"} familyKind - Semantic source-family discriminator.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} module - Validated source module.
   * @returns {string} Slash-separated public subpath.
   */
  publicSubpath(familyKind, module) {
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
  path(family, module) {
    const suffix = module.variant === undefined
      ? `${module.name}.ts`
      : `${module.name}/${module.variant}.ts`;

    return posix.join(family.facadeDirectory, suffix);
  }
}
