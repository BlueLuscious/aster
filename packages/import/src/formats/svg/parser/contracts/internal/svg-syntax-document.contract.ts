import type { ISvgSyntaxElement } from "./svg-syntax-element.contract.js";

/**
 * @description Internal untrusted syntax document produced only from well-formed accepted XML.
 */
export interface ISvgSyntaxDocument {
  /**
   * @description Canonical logical source identifier.
   */
  readonly sourceId: string;

  /**
   * @description Sole parsed SVG root in exact source order.
   */
  readonly root: ISvgSyntaxElement;
}
