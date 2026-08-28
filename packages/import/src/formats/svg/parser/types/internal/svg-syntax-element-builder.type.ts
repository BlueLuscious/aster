import type { SourceSpan } from "../../../../../diagnostic/contracts/index.js";
import type { TSvgAttributeInput } from "./svg-attribute-input.type.js";

/**
 * @description Mutable construction-only state for one parser-neutral SVG syntax element.
 */
export type TSvgSyntaxElementBuilder = {
  /**
   * @description Exact qualified element name.
   */
  readonly name: string;

  /**
   * @description Local element name.
   */
  readonly localName: string;

  /**
   * @description Authored namespace prefix.
   */
  readonly prefix: string;

  /**
   * @description Resolved namespace URI.
   */
  readonly namespaceUri: string;

  /**
   * @description Located attributes in exact source order.
   */
  readonly attributes: readonly TSvgAttributeInput[];

  /**
   * @description Complete opening-tag span.
   */
  readonly openingSpan: SourceSpan;

  /**
   * @description Exact opening qualified-name span.
   */
  readonly nameSpan: SourceSpan;

  /**
   * @description Child construction state in exact source order.
   */
  readonly children: TSvgSyntaxElementBuilder[];

  /**
   * @description Exclusive element end offset once its closing boundary is known.
   */
  endOffset: number;
};
