import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { BuildValueValidator } from "../../shared/runtime/build-value.validator.js";

/**
 * @description Produces stable single-line diagnostic and related-context messages.
 */
export class DiagnosticMessageNormaliser {
  /**
   * @description Primitive build-value validator.
   */
  readonly #validator = new BuildValueValidator();

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
      throw new BuildContractError(
        path,
        "expected non-empty single-line text",
      );
    }

    return trimmed;
  }
}
