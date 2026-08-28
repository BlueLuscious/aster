import { IconImportError } from "../../error/index.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";

/**
 * @description Produces stable single-line diagnostic and related-context messages.
 */
export class DiagnosticMessageNormaliser {
  /**
   * @description Primitive Import value validator.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Produces one trimmed stable message.
   * @param value - Unknown message.
   * @param path - Logical message path.
   * @returns Trimmed non-empty single-line message.
   */
  normalise(value: unknown, path: string): string {
    const accepted = this.#validator.nonEmptyString(value, path);
    const trimmed = accepted.trim();

    if (trimmed.length === 0 || /[\r\n]/u.test(trimmed)) {
      throw new IconImportError(
        path,
        "expected non-empty single-line text",
      );
    }

    return trimmed;
  }
}
