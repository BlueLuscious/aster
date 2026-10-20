import { CanonicalSlugValidator } from "../../shared/runtime/canonical-slug.validator.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Canonicalises ordered intrinsic tags shared by icon and collection metadata.
 */
export class MetadataTagSequenceNormaliser {
  /** @description Primitive authored-value acceptance boundary. */
  readonly #validator = new IconValueValidator();

  /** @description Canonical intrinsic-tag slug validator. */
  readonly #slugValidator = new CanonicalSlugValidator();

  /**
   * @description Isolates and freezes canonical tags while rejecting duplicates after text adaptation.
   * @param value - Unknown authored tag sequence.
   * @param path - Logical sequence path owned by the metadata consumer.
   * @returns Frozen unique tags preserving authored order, including an empty sequence.
   */
  normalise(value: unknown, path: string): readonly string[] {
    const tags = this.#validator.array(value, path).map((tag, index) => {
      const tagPath = `${path}[${index}]`;
      return this.#slugValidator.validate(this.#validator.text(tag, tagPath), tagPath);
    });

    if (new Set(tags).size !== tags.length) {
      throw new IconDefinitionError(path, "expected unique tags");
    }

    return Object.freeze(tags);
  }
}
