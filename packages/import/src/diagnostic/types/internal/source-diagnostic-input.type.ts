import type { DiagnosticRelatedContext, SourceSpan } from "../../contracts/index.js";
import type { DiagnosticCodeType } from "../diagnostic-code.type.js";

/**
 * @description Occurrence-specific input completed by the canonical diagnostic code policy.
 */
export type TSourceDiagnosticInput = {
  /**
   * @description Stable code that owns category and severity.
   */
  readonly code: DiagnosticCodeType;

  /**
   * @description Stable single-line diagnostic explanation.
   */
  readonly message: string;

  /**
   * @description Canonical logical source identifier.
   */
  readonly sourceId: string;

  /**
   * @description Exact primary source evidence when available.
   */
  readonly span?: SourceSpan;

  /**
   * @description Additional independently located source evidence when required.
   */
  readonly related?: readonly DiagnosticRelatedContext[];
};
