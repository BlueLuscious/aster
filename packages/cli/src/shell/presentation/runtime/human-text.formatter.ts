/**
 * @description Formats shared deterministic human-text structures without owning payload semantics.
 */
export class HumanTextFormatter {
  /**
   * @description Adds a stable heading and explicit empty-state text to result lines.
   * @param heading - Human-readable result-family heading.
   * @param entries - Canonically ordered result lines.
   * @returns Deterministic multi-line sequence text.
   */
  sequence(heading: string, entries: readonly string[]): string {
    return [
      `${heading}:`,
      ...(entries.length === 0
        ? ["  (none)"]
        : entries.map((entry) => `  ${entry}`)),
    ].join("\n");
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
}
