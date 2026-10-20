import type { CollectionMetadata } from "../contracts/index.js";
import { MetadataTagSequenceNormaliser } from "../../metadata/runtime/metadata-tag-sequence.normaliser.js";
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
   * @description Intrinsic metadata-tag sequence authority shared with icons.
   */
  readonly #tagNormaliser = new MetadataTagSequenceNormaliser();

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
      ["displayName"],
    );
    const displayName = this.#validator.text(
      record.displayName,
      `${path}.displayName`,
    );
    const description =
      Object.hasOwn(record, "description")
        ? this.#validator.text(record.description, `${path}.description`)
        : undefined;
    const tags =
      Object.hasOwn(record, "tags")
        ? this.#tagNormaliser.normalise(record.tags, `${path}.tags`)
        : undefined;
    const licence =
      Object.hasOwn(record, "licence")
        ? this.#validator.text(record.licence, `${path}.licence`)
        : undefined;
    const attribution =
      Object.hasOwn(record, "attribution")
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
}
