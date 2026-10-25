/**
 * @description Formats shared deterministic human-text structures without owning payload semantics.
 */
export class HumanTextFormatter {
  /**
   * @description Control characters that require a quoted visible representation in human data.
   */
  readonly #controlPattern = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u;

  /**
   * @description Controls left literal by JSON string encoding that must remain visible in human text.
   */
  readonly #additionalControlPattern = /[\u007f-\u009f\u2028\u2029]/gu;

  /**
   * @description Preserves printable data or quotes and escapes a value containing controls.
   * @remarks Structural headings and line breaks belong to the presenter, not the data value.
   * @param value - Original data value without presentation decoration.
   * @returns Printable value with embedded controls represented visibly and without data loss.
   */
  value(value: string): string {
    if (!this.#controlPattern.test(value)) {
      return value;
    }

    return JSON.stringify(value).replace(
      this.#additionalControlPattern,
      this.#unicodeEscape,
    );
  }

  /**
   * @description Adds a stable heading and indents every line of each entry, including nested sequences.
   * @param heading - Human-readable result-family heading.
   * @param entries - Canonically ordered result lines.
   * @returns Deterministic multi-line sequence text.
   */
  sequence(heading: string, entries: readonly string[]): string {
    return [
      `${heading}:`,
      ...(entries.length === 0
        ? ["  (none)"]
        : entries.map((entry) => this.indent(entry))),
    ].join("\n");
  }

  /**
   * @description Indents a complete human-text entry by one two-space ownership level.
   * @param entry - Structural text whose embedded lines retain their relative indentation.
   * @returns Entry with one indentation level added to every line.
   */
  indent(entry: string): string {
    return `  ${entry.replaceAll("\n", "\n  ")}`;
  }

  /**
   * @description Formats a count with deterministic English singular or plural spelling.
   * @param value - Non-negative item count.
   * @param noun - Singular item-family noun.
   * @returns Count followed by its correctly inflected noun.
   */
  count(value: number, noun: string): string {
    return `${value} ${noun}${value === 1 ? "" : "s"}`;
  }

  /**
   * @description Encodes one remaining control as a fixed-width Unicode escape.
   * @param value - Single control character selected by the formatter.
   * @returns Visible JSON-compatible escape for that character.
   */
  #unicodeEscape(value: string): string {
    return `\\u${value.charCodeAt(0).toString(16).padStart(4, "0")}`;
  }
}
