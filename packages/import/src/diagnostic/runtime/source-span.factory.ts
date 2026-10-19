import type {
  SourcePosition,
  SourceSpan,
} from "../contracts/index.js";
import { IconImportError } from "../../error/index.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";

/**
 * @description Validates, clones, and freezes externally assembled source spans.
 */
export class SourceSpanFactory {
  /**
   * @description Primitive Import value validator.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Creates one internally consistent immutable source span.
   * @param value - Unknown source span.
   * @param path - Logical span path.
   * @returns Deeply frozen source span.
   */
  create(value: unknown, path: string): SourceSpan {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["start", "end"], path);
    const start = this.#createPosition(
      Object.hasOwn(record, "start") ? record.start : undefined,
      `${path}.start`,
    );
    const end = this.#createPosition(
      Object.hasOwn(record, "end") ? record.end : undefined,
      `${path}.end`,
    );

    if (
      end.offset < start.offset ||
      end.line < start.line ||
      (end.line === start.line && end.column < start.column)
    ) {
      throw new IconImportError(`${path}.end`, "cannot precede the start");
    }

    return Object.freeze({ start, end });
  }

  /**
   * @description Creates one validated immutable source position.
   * @param value - Unknown source position.
   * @param path - Logical position path.
   * @returns Frozen source position.
   */
  #createPosition(value: unknown, path: string): SourcePosition {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["offset", "line", "column"], path);

    return Object.freeze({
      offset: this.#validator.integer(
        Object.hasOwn(record, "offset") ? record.offset : undefined,
        0,
        `${path}.offset`,
      ),
      line: this.#validator.integer(
        Object.hasOwn(record, "line") ? record.line : undefined,
        1,
        `${path}.line`,
      ),
      column: this.#validator.integer(
        Object.hasOwn(record, "column") ? record.column : undefined,
        1,
        `${path}.column`,
      ),
    });
  }
}
