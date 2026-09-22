import type { SvgIconImportSource } from "../contracts/svg-icon-import-source.contract.js";
import type { IconImportSourceType } from "../types/icon-import-source.type.js";
import { IconImportError } from "../../error/index.js";
import { iconImportFormats } from "../../format/constants/icon-import-formats.constant.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { SourceIdNormaliser } from "./source-id.normaliser.js";
import { SourceIdentityNormaliser } from "./source-identity.normaliser.js";

/**
 * @description Validates and isolates public format-discriminated import sources.
 */
export class IconImportSourceNormaliser {
  /**
   * @description Primitive Import value validation authority.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Logical source identifier normalisation authority.
   */
  readonly #sourceIdNormaliser = new SourceIdNormaliser();

  /**
   * @description Portable source identity normalisation authority.
   */
  readonly #identityNormaliser = new SourceIdentityNormaliser();

  /**
   * @description Normalises one public source without inferring its format.
   * @param value - Unknown source supplied through the public API.
   * @returns Frozen isolated built-in source.
   */
  normalise(value: unknown): IconImportSourceType {
    const path = "source";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["format", "sourceId", "identity", "content"],
      path,
      ["format", "sourceId", "identity", "content"],
    );

    if (record.format !== iconImportFormats.svg) {
      throw new IconImportError("source.format", "unsupported import format");
    }

    return Object.freeze({
      format: iconImportFormats.svg,
      sourceId: this.#sourceIdNormaliser.normalise(
        record.sourceId,
        `${path}.sourceId`,
      ),
      identity: this.#identityNormaliser.normalise(
        record.identity,
        `${path}.identity`,
      ),
      content: this.#content(record.content, `${path}.content`),
    }) satisfies SvgIconImportSource;
  }

  /**
   * @description Validates exact decoded Unicode source text without normalising bytes.
   * @param value - Unknown decoded source content.
   * @param path - Logical content path.
   * @returns Accepted source text.
   */
  #content(value: unknown, path: string): string {
    if (typeof value !== "string") {
      throw new IconImportError(path, "expected decoded text");
    }

    if (value.startsWith("\uFEFF")) {
      throw new IconImportError(path, "byte-order marks are not accepted");
    }

    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);

      if (code >= 0xd800 && code <= 0xdbff) {
        const next = value.charCodeAt(index + 1);
        if (!(next >= 0xdc00 && next <= 0xdfff)) {
          throw new IconImportError(path, "expected valid Unicode text");
        }
        index += 1;
      } else if (code >= 0xdc00 && code <= 0xdfff) {
        throw new IconImportError(path, "expected valid Unicode text");
      }
    }

    return value;
  }
}
