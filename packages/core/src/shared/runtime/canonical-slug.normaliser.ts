import { IconDefinitionError } from "./icon-definition.error.js";

/**
 * @description Validates canonical ASCII lowercase kebab-case domain slugs.
 */
export class CanonicalSlugNormaliser {
  /**
   * @description Canonical portable slug grammar.
   */
  readonly #pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /**
   * @description Accepts one canonical slug without changing its identity.
   * @param value - Candidate slug.
   * @param path - Logical value path.
   * @returns Accepted canonical slug.
   */
  normalise(value: string, path: string): string {
    if (!this.#pattern.test(value)) {
      throw new IconDefinitionError(
        path,
        "expected an ASCII lowercase kebab-case slug",
      );
    }

    return value;
  }
}
