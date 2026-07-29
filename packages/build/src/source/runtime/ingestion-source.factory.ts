import type {
  CanonicalSvgSource,
  CollectionMetadataSource,
  IconMetadataSource,
} from "../contracts/index.js";
import type { IngestionSourceType } from "../types/index.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { BuildValueValidator } from "../../shared/runtime/build-value.validator.js";
import { ingestionSourceKinds } from "../constants/ingestion-source-kinds.constant.js";
import { SourceIdNormaliser } from "./source-id.normaliser.js";
import { SourceIdentityNormaliser } from "./source-identity.normaliser.js";

/**
 * @description Validates, isolates, and freezes canonical textual source descriptors.
 */
export class IngestionSourceFactory {
  /**
   * @description Primitive build-value validator.
   */
  readonly #validator = new BuildValueValidator();

  /**
   * @description Logical source identifier normaliser.
   */
  readonly #sourceIdNormaliser = new SourceIdNormaliser();

  /**
   * @description Canonical identity normaliser.
   */
  readonly #identityNormaliser = new SourceIdentityNormaliser();

  /**
   * @description Creates one accepted source descriptor without changing source contents.
   * @param value - Unknown source descriptor.
   * @returns Frozen isolated source descriptor.
   */
  create(value: unknown): IngestionSourceType {
    const path = "source";
    const record = this.#validator.record(value, path);
    const sourceId = this.#sourceIdNormaliser.normalise(
      record.sourceId,
      `${path}.sourceId`,
    );
    const content = this.#acceptContent(record.content, `${path}.content`);

    switch (record.kind) {
      case ingestionSourceKinds.svg:
        return this.#createSvg(record, sourceId, content, path);
      case ingestionSourceKinds.collectionMetadata:
        return this.#createCollectionMetadata(record, sourceId, content, path);
      case ingestionSourceKinds.iconMetadata:
        return this.#createIconMetadata(record, sourceId, content, path);
      default:
        throw new BuildContractError(`${path}.kind`, "unsupported source kind");
    }
  }

  /**
   * @description Creates one canonical SVG descriptor.
   * @param record - Authored source record.
   * @param sourceId - Accepted logical source identifier.
   * @param content - Accepted exact source content.
   * @param path - Logical source path.
   * @returns Frozen canonical SVG source.
   */
  #createSvg(
    record: Record<string, unknown>,
    sourceId: string,
    content: string,
    path: string,
  ): CanonicalSvgSource {
    this.#validator.exactFields(
      record,
      ["kind", "sourceId", "content", "identity"],
      path,
    );

    return Object.freeze({
      kind: ingestionSourceKinds.svg,
      sourceId,
      content,
      identity: this.#identityNormaliser.normalise(
        record.identity,
        `${path}.identity`,
      ),
    });
  }

  /**
   * @description Creates one collection metadata descriptor.
   * @param record - Authored source record.
   * @param sourceId - Accepted logical source identifier.
   * @param content - Accepted exact source content.
   * @param path - Logical source path.
   * @returns Frozen collection metadata source.
   */
  #createCollectionMetadata(
    record: Record<string, unknown>,
    sourceId: string,
    content: string,
    path: string,
  ): CollectionMetadataSource {
    this.#validator.exactFields(
      record,
      ["kind", "sourceId", "content", "collection"],
      path,
    );

    return Object.freeze({
      kind: ingestionSourceKinds.collectionMetadata,
      sourceId,
      content,
      collection: this.#identityNormaliser.normaliseCollection(
        record.collection,
        `${path}.collection`,
      ),
    });
  }

  /**
   * @description Creates one icon metadata descriptor.
   * @param record - Authored source record.
   * @param sourceId - Accepted logical source identifier.
   * @param content - Accepted exact source content.
   * @param path - Logical source path.
   * @returns Frozen icon metadata source.
   */
  #createIconMetadata(
    record: Record<string, unknown>,
    sourceId: string,
    content: string,
    path: string,
  ): IconMetadataSource {
    this.#validator.exactFields(
      record,
      ["kind", "sourceId", "content", "identity"],
      path,
    );

    return Object.freeze({
      kind: ingestionSourceKinds.iconMetadata,
      sourceId,
      content,
      identity: this.#identityNormaliser.normalise(
        record.identity,
        `${path}.identity`,
      ),
    });
  }

  /**
   * @description Accepts exact UTF-8-representable text without a byte-order mark.
   * @param value - Unknown decoded source content.
   * @param path - Logical content path.
   * @returns Accepted source content without modification.
   */
  #acceptContent(value: unknown, path: string): string {
    if (typeof value !== "string") {
      throw new BuildContractError(path, "expected decoded UTF-8 text");
    }

    if (value.startsWith("\uFEFF")) {
      throw new BuildContractError(path, "byte-order marks are not accepted");
    }

    for (let index = 0; index < value.length; index += 1) {
      const unit = value.charCodeAt(index);

      if (unit >= 0xd800 && unit <= 0xdbff) {
        const following = value.charCodeAt(index + 1);

        if (
          !Number.isInteger(following) ||
          following < 0xdc00 ||
          following > 0xdfff
        ) {
          throw new BuildContractError(path, "expected valid Unicode text");
        }

        index += 1;
      } else if (unit >= 0xdc00 && unit <= 0xdfff) {
        throw new BuildContractError(path, "expected valid Unicode text");
      }
    }

    return value;
  }
}
