import type { SourceSpan } from "../../../../diagnostic/contracts/index.js";

/**
 * @description Marks source path arithmetic that cannot produce finite portable coordinates.
 */
export class SvgPathExpansionError extends Error {
  /**
   * @description Exact authored path-data value span responsible for the overflow.
   */
  readonly span: SourceSpan;

  /**
   * @description Retains source evidence for a failed SVG-to-portable path expansion.
   * @param span - Exact authored path-data value span.
   */
  constructor(span: SourceSpan) {
    super("SVG path expansion exceeds the finite portable numeric domain.");
    this.name = "SvgPathExpansionError";
    this.span = span;
  }
}
