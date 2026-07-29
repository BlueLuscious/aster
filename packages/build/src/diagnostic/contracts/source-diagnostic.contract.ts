import type {
  DiagnosticCategoryType,
  DiagnosticCodeType,
  DiagnosticSeverityType,
} from "../types/index.js";
import type { DiagnosticRelatedContext } from "./diagnostic-related-context.contract.js";
import type { SourceSpan } from "./source-span.contract.js";

/**
 * @description Stable Aster-owned report about canonical source or generation input.
 */
export interface SourceDiagnostic {
  /**
   * @description Stable Aster-owned identifier whose category matches `category`.
   */
  readonly code: DiagnosticCodeType;

  /**
   * @description Blocking or advisory authority of the report.
   */
  readonly severity: DiagnosticSeverityType;

  /**
   * @description Responsibility that owns the diagnostic meaning.
   */
  readonly category: DiagnosticCategoryType;

  /**
   * @description Deterministic explanation without environment-specific text.
   */
  readonly message: string;

  /**
   * @description Canonical logical source identifier using `/` separators.
   */
  readonly sourceId: string;

  /**
   * @description Trustworthy primary span when exact source evidence is available.
   */
  readonly span?: SourceSpan;

  /**
   * @description Deterministically ordered additional source relationships.
   */
  readonly related?: readonly DiagnosticRelatedContext[];
}
