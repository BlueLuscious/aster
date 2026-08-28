import type { SourceSpan } from "./source-span.contract.js";

/**
 * @description Additional deterministic source context needed to explain one diagnostic.
 */
export interface DiagnosticRelatedContext {
  /**
   * @description Stable explanation of the relationship.
   */
  readonly message: string;

  /**
   * @description Canonical logical source identifier.
   */
  readonly sourceId: string;

  /**
   * @description Trustworthy related span when exact source evidence is available.
   */
  readonly span?: SourceSpan;
}
