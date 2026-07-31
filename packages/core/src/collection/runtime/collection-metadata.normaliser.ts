import type { CollectionMetadata } from "../contracts/index.js";
import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates, clones, and freezes portable collection metadata.
 */
export class CollectionMetadataNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Canonical intrinsic tag authority.
   */
  readonly #slugNormaliser = new CanonicalSlugNormaliser();

  /**
   * @description Produces one deeply frozen canonical collection metadata value.
   * @param value - Unknown authored collection metadata.
   * @param path - Logical metadata path.
   * @returns Deeply frozen canonical collection metadata.
   */
  normalise(
    value: unknown,
    path = "collection.metadata",
  ): CollectionMetadata {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["displayName", "description", "tags", "licence", "attribution"],
      path,
    );
    const displayName = this.#validator.text(
      record.displayName,
      `${path}.displayName`,
    );
    const description =
      "description" in record
        ? this.#validator.text(record.description, `${path}.description`)
        : undefined;
    const tags =
      "tags" in record
        ? this.#normaliseTags(record.tags, `${path}.tags`)
        : undefined;
    const licence =
      "licence" in record
        ? this.#validator.text(record.licence, `${path}.licence`)
        : undefined;
    const attribution =
      "attribution" in record
        ? this.#validator.text(record.attribution, `${path}.attribution`)
        : undefined;

    if (attribution !== undefined && licence === undefined) {
      throw new IconDefinitionError(
        `${path}.attribution`,
        "requires an effective licence",
      );
    }

    return Object.freeze({
      displayName,
      ...(description === undefined ? {} : { description }),
      ...(tags === undefined ? {} : { tags }),
      ...(licence === undefined ? {} : { licence }),
      ...(attribution === undefined ? {} : { attribution }),
    });
  }

  /**
   * @description Validates, deduplicates, and freezes intrinsic collection tags.
   * @param value - Unknown authored tag collection.
   * @param path - Logical tag collection path.
   * @returns Frozen tags preserving authored order.
   */
  #normaliseTags(value: unknown, path: string): readonly string[] {
    const tags = this.#validator.array(value, path).map((tag, index) => {
      const tagPath = `${path}[${index}]`;
      return this.#slugNormaliser.normalise(
        this.#validator.text(tag, tagPath),
        tagPath,
      );
    });

    if (new Set(tags).size !== tags.length) {
      throw new IconDefinitionError(path, "expected unique tags");
    }

    return Object.freeze(tags);
  }
}
