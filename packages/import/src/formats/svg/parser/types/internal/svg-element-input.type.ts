import type { SourceSpan } from "../../../../../diagnostic/contracts/index.js";
import type { TSvgAttributeInput } from "./svg-attribute-input.type.js";

/**
 * @description Parser-neutral internal input for one located SVG syntax element.
 */
export type TSvgElementInput = {
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
   * @description Attributes in exact source order.
   */
  readonly attributes: readonly TSvgAttributeInput[];

  /**
   * @description Whether the opening tag closes the element directly.
   */
  readonly selfClosing: boolean;

  /**
   * @description One-based structural depth including the document root.
   */
  readonly depth: number;

  /**
   * @description Complete opening-tag span.
   */
  readonly openingSpan: SourceSpan;

  /**
   * @description Exact opening qualified-name span.
   */
  readonly nameSpan: SourceSpan;
};
