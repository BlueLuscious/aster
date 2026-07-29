import type { SourceSpan } from "../../../diagnostic/contracts/index.js";

/**
 * @description Internal untrusted SVG attribute retaining exact authored text and source evidence.
 */
export interface ISvgSyntaxAttribute {
  /**
   * @description Exact qualified attribute name.
   */
  readonly name: string;

  /**
   * @description Local attribute name without a namespace prefix.
   */
  readonly localName: string;

  /**
   * @description Authored namespace prefix, or an empty string when absent.
   */
  readonly prefix: string;

  /**
   * @description Resolved namespace URI, or an empty string when the attribute has no namespace.
   */
  readonly namespaceUri: string;

  /**
   * @description Exact authored value between the attribute quotes.
   */
  readonly value: string;

  /**
   * @description Complete attribute span including its name, assignment, quotes, and value.
   */
  readonly span: SourceSpan;

  /**
   * @description Exact qualified-name span.
   */
  readonly nameSpan: SourceSpan;

  /**
   * @description Exact value span excluding its quotes.
   */
  readonly valueSpan: SourceSpan;
}
