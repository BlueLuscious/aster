import type { ISvgSyntaxDocument } from "../../../parser/contracts/internal/svg-syntax-document.contract.js";
import type { CanonicalSvgSource } from "../../../source/contracts/index.js";

/**
 * @description One acquired canonical SVG and parser-safe syntax document awaiting metadata pairing.
 */
export interface ISvgValidationEntry {
  /**
   * @description Canonical SVG source carrying the independently acquired identity.
   */
  readonly source: CanonicalSvgSource;

  /**
   * @description Complete parser-owned syntax document for the same SVG source.
   */
  readonly document: ISvgSyntaxDocument;
}
