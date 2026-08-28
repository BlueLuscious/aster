import type { SourceSpan } from "../../../../../diagnostic/contracts/index.js";
import type { TSvgAttributeLocation } from "./svg-attribute-location.type.js";

/**
 * @description Exact source locations recovered from one parser-validated SVG opening tag.
 */
export type TSvgTagLocation = {
  /**
   * @description Complete opening-tag span.
   */
  readonly span: SourceSpan;

  /**
   * @description Exact opening qualified-name span.
   */
  readonly nameSpan: SourceSpan;

  /**
   * @description Located attributes in exact source order.
   */
  readonly attributes: readonly TSvgAttributeLocation[];

  /**
   * @description First repeated qualified attribute name when the parser accepted a duplicate.
   */
  readonly duplicateAttributeName?: string;
};
