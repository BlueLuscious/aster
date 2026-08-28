import type { SourceSpan } from "../../../../../diagnostic/contracts/index.js";

/**
 * @description Exact source locations recovered for one parser-validated SVG attribute.
 */
export type TSvgAttributeLocation = {
  /**
   * @description Exact qualified attribute name.
   */
  readonly name: string;

  /**
   * @description Exact authored unquoted value.
   */
  readonly value: string;

  /**
   * @description Complete attribute span.
   */
  readonly span: SourceSpan;

  /**
   * @description Exact qualified-name span.
   */
  readonly nameSpan: SourceSpan;

  /**
   * @description Exact unquoted value span.
   */
  readonly valueSpan: SourceSpan;
};
