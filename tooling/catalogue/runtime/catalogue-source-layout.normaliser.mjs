import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Normalises flat transitional and nested canonical source paths to logical identity.
 */
export class CatalogueSourceLayoutNormaliser {
  /** @description Package-owned icon and collection name grammar. */
  static #namePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

  /** @description Portable Core slug grammar retained by optional icon variants. */
  static #variantPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /**
   * @description Resolves one source-family-relative path to canonical identity and symbol.
   * @param {string} relativePath - Slash-separated path beneath the configured family root.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @returns {import("../contracts/internal/catalogue-source-identity.contract.mjs").ICatalogueSourceIdentity} Frozen path-owned identity.
   */
  normalise(relativePath, family) {
    const segments = relativePath.split("/");
    const filename = segments.at(-1);
    const stem = filename.slice(0, -family.sourceSuffix.length);
    let name;
    let variant;

    if (segments.length === 1) {
      name = stem;
      this.#assertName(name, relativePath);
    } else {
      ({ name, variant } = this.#normaliseNested(
        segments,
        stem,
        relativePath,
        family,
      ));
    }

    return Object.freeze({
      name,
      variant,
      symbol: `${this.#pascalCase(name)}${
        variant === undefined ? "" : this.#pascalCase(variant)
      }${family.symbolSuffix}`,
    });
  }

  /**
   * @description Normalises one nested initial-and-name source path.
   * @param {readonly string[]} segments - Relative source path segments.
   * @param {string} stem - Source filename without its role suffix.
   * @param {string} relativePath - Portable source path used for failure context.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @returns {{ name: string, variant: string | undefined }} Nested logical identity.
   */
  #normaliseNested(segments, stem, relativePath, family) {
    if (segments.length !== 3) {
      throw new CatalogueSourceError(
        `Invalid canonical catalogue source path: ${relativePath}`,
      );
    }

    const [initial, name] = segments;
    this.#assertName(name, relativePath);

    if (initial.length !== 1 || initial !== name[0]) {
      throw new CatalogueSourceError(
        `Invalid canonical catalogue source initial directory: ${relativePath}`,
      );
    }

    if (stem === name) {
      return Object.freeze({ name, variant: undefined });
    }

    if (family.kind !== catalogueSourceFamilyKinds.icon) {
      throw new CatalogueSourceError(
        `Invalid canonical collection source filename: ${relativePath}`,
      );
    }

    const prefix = `${name}-`;
    const variant = stem.startsWith(prefix) ? stem.slice(prefix.length) : "";

    if (!CatalogueSourceLayoutNormaliser.#variantPattern.test(variant)) {
      throw new CatalogueSourceError(
        `Invalid canonical icon variant source filename: ${relativePath}`,
      );
    }

    return Object.freeze({ name, variant });
  }

  /**
   * @description Requires one package-owned canonical definition name.
   * @param {string} name - Candidate definition name.
   * @param {string} relativePath - Source path used for actionable failure context.
   * @returns {void}
   */
  #assertName(name, relativePath) {
    if (!CatalogueSourceLayoutNormaliser.#namePattern.test(name)) {
      throw new CatalogueSourceError(
        `Invalid canonical catalogue source name in path: ${relativePath}`,
      );
    }
  }

  /**
   * @description Converts one canonical kebab-case slug to its expected PascalCase symbol.
   * @param {string} slug - Valid canonical source slug.
   * @returns {string} Expected source export symbol stem.
   */
  #pascalCase(slug) {
    return slug
      .split("-")
      .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
      .join("");
  }
}
