import { posix } from "node:path";

import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

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

    if (module.variant === undefined) {
      throw new CatalogueSourceError(`Canonical icon ${module.name} requires an explicit variant.`);
    }

    return `${module.name}/${module.variant}`;
  }

  /**
   * @description Resolves one logical definition to its generated TypeScript facade path.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} module - Validated source module.
   * @returns {string} Package-relative generated facade path.
   */
  path(family, module) {
    if (family.kind === catalogueSourceFamilyKinds.icon && module.variant === undefined) {
      throw new CatalogueSourceError(`Canonical icon ${module.name} requires an explicit variant.`);
    }

    return family.kind === catalogueSourceFamilyKinds.collection
      ? posix.join(family.facadeDirectory, `${module.name}.ts`)
      : this.#iconPath(family, module.name, module.variant);
  }

  /**
   * @description Resolves a glyph dictionary within the sibling public glyph facade family.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Icon source-family configuration.
   * @param {string} name - Canonical glyph name used by its public subpath.
   * @returns {string} Package-relative generated dictionary path.
   */
  glyphPath(family, name) {
    return this.#iconPath(family, name, undefined);
  }

  /**
   * @description Derives an emitted glyph or treatment wildcard target from the same facade layout.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Icon source-family configuration.
   * @param {string | undefined} variant - Concrete treatment, or undefined for the glyph dictionary.
   * @returns {Readonly<{types: string, import: string}>} Canonical declaration and native ESM export targets.
   */
  exportTarget(family, variant) {
    const source = this.#iconPath(family, "*", variant);
    const target = source.replace(/^src\//u, "./dist/").replace(/\.ts$/u, "");
    return Object.freeze({ types: `${target}.d.ts`, import: `${target}.js` });
  }

  /**
   * @description Shares physical glyph and treatment layout between concrete paths and export patterns.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Icon source family.
   * @param {string} name - Glyph slug or wildcard.
   * @param {string | undefined} variant - Concrete treatment or dictionary selection.
   * @returns {string} Package-relative TypeScript facade path.
   */
  #iconPath(family, name, variant) {
    return variant === undefined
      ? posix.join(posix.dirname(family.facadeDirectory), "glyphs", `${name}.ts`)
      : posix.join(family.facadeDirectory, name, `${variant}.ts`);
  }
}
