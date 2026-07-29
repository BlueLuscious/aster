import type { SourceSpan } from "../../../diagnostic/contracts/index.js";

/**
 * @description Parser-neutral internal input for one located SVG syntax attribute.
 */
export type TSvgAttributeInput = {
  /**
   * @description Exact qualified attribute name.
   */
  readonly name: string;

  /**
   * @description Local attribute name.
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
   * @description Exact authored value.
   */
  readonly value: string;

  /**
   * @description Complete attribute span.
   */
  readonly span: SourceSpan;

  /**
   * @description Exact attribute-name span.
   */
  readonly nameSpan: SourceSpan;

  /**
   * @description Exact unquoted value span.
   */
  readonly valueSpan: SourceSpan;
};
