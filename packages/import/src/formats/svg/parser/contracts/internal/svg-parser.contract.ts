import type { DiagnosticResultType } from "../../../../../diagnostic/types/index.js";
import type { ICanonicalSvgSource } from "../../../../../source/contracts/internal/index.js";
import type { ISvgSyntaxDocument } from "./svg-syntax-document.contract.js";

/**
 * @description Internal Aster-owned boundary for converting canonical SVG text into untrusted syntax.
 */
export interface ISvgParser {
  /**
   * @description Parses one canonical SVG source without granting trust to partial syntax.
   * @param source - Canonical SVG text and independently acquired identity.
   * @returns Complete untrusted syntax or blocking Aster-owned diagnostics without a value.
   */
  parse(source: ICanonicalSvgSource): DiagnosticResultType<ISvgSyntaxDocument>;
}
