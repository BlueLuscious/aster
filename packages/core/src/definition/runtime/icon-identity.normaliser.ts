import type { IconIdentity } from "../contracts/index.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates and clones render-neutral icon identities.
 */
export class IconIdentityNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Canonical grammar for collection, icon, and variant slugs.
   */
  readonly #canonicalSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /**
   * @description Produces one frozen canonical identity.
   * @param value - Unknown authored identity.
   * @param path - Logical object path.
   * @returns Frozen canonical identity.
   */
  normalise(value: unknown, path = "definition.identity"): IconIdentity {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["collection", "name", "variant"], path);

    const collection = this.#validator.text(record.collection, `${path}.collection`);
    const name = this.#validator.text(record.name, `${path}.name`);
    const variant =
      "variant" in record
        ? this.#validator.text(record.variant, `${path}.variant`)
        : undefined;

    this.#assertCanonicalSlug(collection, `${path}.collection`);
    this.#assertCanonicalSlug(name, `${path}.name`);

    if (variant !== undefined) {
      this.#assertCanonicalSlug(variant, `${path}.variant`);
    }

    return Object.freeze({
      collection,
      name,
      ...(variant === undefined ? {} : { variant }),
    });
  }

  /**
   * @description Asserts the canonical render-neutral slug grammar.
   * @param value - Trimmed slug candidate.
   * @param path - Logical value path.
   * @returns Nothing.
   */
  #assertCanonicalSlug(value: string, path: string): void {
    if (!this.#canonicalSlugPattern.test(value)) {
      throw new IconDefinitionError(
        path,
        "expected an ASCII lowercase kebab-case slug",
      );
    }
  }
}
