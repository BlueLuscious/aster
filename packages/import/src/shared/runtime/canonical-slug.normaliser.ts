import { IconImportError } from "../../error/index.js";

/**
 * @description Validates canonical ASCII lowercase kebab-case Import slugs.
 */
export class CanonicalSlugNormaliser {
  /**
   * @description Canonical portable slug grammar.
   */
  readonly #pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /**
   * @description Accepts one canonical slug without changing its identity.
   * @param value - Unknown slug candidate.
   * @param path - Logical slug path.
   * @returns Accepted canonical slug.
   */
  normalise(value: unknown, path: string): string {
    if (typeof value !== "string" || !this.#pattern.test(value)) {
      throw new IconImportError(
        path,
        "expected an ASCII lowercase kebab-case slug",
      );
    }

    return value;
  }
}
