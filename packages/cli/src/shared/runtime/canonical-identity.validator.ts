import { cliIdentitySchema } from "../constants/cli-identity-schema.constant.js";

/**
 * @description Validates CLI-owned provider and portable textual identity representations.
 */
export class CanonicalIdentityValidator {
  /**
   * @description Canonical lowercase ASCII kebab-case slug grammar.
   */
  readonly #slugPattern = new RegExp(cliIdentitySchema.slugPatternSource, "u");

  /**
   * @description Determines whether a candidate is one canonical slug.
   * @param value - Candidate slug.
   * @returns Whether the value belongs to the accepted grammar.
   */
  slug(value: unknown): value is string {
    return typeof value === "string" && this.#slugPattern.test(value);
  }

  /**
   * @description Determines whether a candidate is a canonical icon identity with a required treatment.
   * @param value - Candidate icon identity.
   * @returns Whether the value follows `[namespace/]name@variant`.
   */
  icon(value: unknown): value is string {
    return this.#identity(value, true);
  }

  /**
   * @description Determines whether a candidate is a canonical collection identity without a variant.
   * @param value - Candidate collection identity.
   * @returns Whether the value follows `[namespace/]name`.
   */
  collection(value: unknown): value is string {
    return this.#identity(value, false);
  }

  /**
   * @description Validates one portable textual identity family.
   * @param value - Candidate textual identity.
   * @param requiresVariant - Whether exactly one treatment component is required rather than forbidden.
   * @returns Whether every identity component is canonical.
   */
  #identity(value: unknown, requiresVariant: boolean): value is string {
    if (typeof value !== "string") {
      return false;
    }

    const variantSections = value.split(cliIdentitySchema.variantSeparator);

    if (variantSections.length !== (requiresVariant ? 2 : 1)) {
      return false;
    }

    const identity = variantSections[0];
    const variant = variantSections[1];

    if (identity === undefined || (variant !== undefined && !this.slug(variant))) {
      return false;
    }

    const identitySections = identity.split(cliIdentitySchema.namespaceSeparator);
    return (
      identitySections.length <= cliIdentitySchema.maximumIdentitySections
      && identitySections.every((section) => this.slug(section))
    );
  }
}
