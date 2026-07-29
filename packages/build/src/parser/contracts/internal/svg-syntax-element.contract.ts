import type { SourceSpan } from "../../../diagnostic/contracts/index.js";
import type { ISvgSyntaxAttribute } from "./svg-syntax-attribute.contract.js";

/**
 * @description Internal untrusted SVG element retaining hierarchy, spelling, and exact source evidence.
 */
export interface ISvgSyntaxElement {
  /**
   * @description Exact qualified element name.
   */
  readonly name: string;

  /**
   * @description Local element name without a namespace prefix.
   */
  readonly localName: string;

  /**
   * @description Authored namespace prefix, or an empty string when absent.
   */
  readonly prefix: string;

  /**
   * @description Resolved element namespace URI.
   */
  readonly namespaceUri: string;

  /**
   * @description Attributes in exact source order.
   */
  readonly attributes: readonly ISvgSyntaxAttribute[];

  /**
   * @description Child elements in exact paint and source order.
   */
  readonly children: readonly ISvgSyntaxElement[];

  /**
   * @description Complete opening-tag span.
   */
  readonly openingSpan: SourceSpan;

  /**
   * @description Exact qualified-name span in the opening tag.
   */
  readonly nameSpan: SourceSpan;

  /**
   * @description Complete element span including its closing tag when present.
   */
  readonly span: SourceSpan;
}
