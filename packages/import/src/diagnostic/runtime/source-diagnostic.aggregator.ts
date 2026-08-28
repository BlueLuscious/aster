import type { SourceDiagnostic } from "../contracts/index.js";
import type { TIndexedDiagnostic } from "../types/internal/indexed-diagnostic.type.js";
import { diagnosticSeverities } from "../constants/diagnostic-severities.constant.js";
import { SourceDiagnosticFactory } from "./source-diagnostic.factory.js";

/**
 * @description Canonicalises, deduplicates, and deterministically orders diagnostics.
 */
export class SourceDiagnosticAggregator {
  /**
   * @description Diagnostic construction authority.
   */
  readonly #factory = new SourceDiagnosticFactory();

  /**
   * @description Aggregates diagnostics independently from producer completion order.
   * @param values - Unknown diagnostic values in stable semantic encounter order.
   * @returns Frozen canonical diagnostic sequence.
   */
  aggregate(values: readonly unknown[]): readonly SourceDiagnostic[] {
    const entries: TIndexedDiagnostic[] = values.map((value, index) => ({
      diagnostic: this.#factory.create(value),
      index,
    }));
    const unique = new Map<string, (typeof entries)[number]>();

    for (const entry of entries) {
      const key = JSON.stringify(entry.diagnostic);

      if (!unique.has(key)) {
        unique.set(key, entry);
      }
    }

    return Object.freeze(
      [...unique.values()]
        .sort((left, right) => this.#compareEntries(left, right))
        .map((entry) => entry.diagnostic),
    );
  }

  /**
   * @description Compares indexed diagnostics by the accepted canonical order.
   * @param left - First indexed diagnostic.
   * @param right - Second indexed diagnostic.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareEntries(
    left: TIndexedDiagnostic,
    right: TIndexedDiagnostic,
  ): number {
    return (
      this.#compareText(
        left.diagnostic.sourceId,
        right.diagnostic.sourceId,
      ) ||
      this.#spanStart(left.diagnostic) - this.#spanStart(right.diagnostic) ||
      this.#spanEnd(left.diagnostic) - this.#spanEnd(right.diagnostic) ||
      this.#severityRank(left.diagnostic) -
        this.#severityRank(right.diagnostic) ||
      this.#compareText(
        left.diagnostic.category,
        right.diagnostic.category,
      ) ||
      this.#compareText(left.diagnostic.code, right.diagnostic.code) ||
      left.index - right.index
    );
  }

  /**
   * @description Resolves a primary start offset for canonical sorting.
   * @param diagnostic - Diagnostic to inspect.
   * @returns Start offset, or negative one for whole-source context.
   */
  #spanStart(diagnostic: SourceDiagnostic): number {
    return diagnostic.span?.start.offset ?? -1;
  }

  /**
   * @description Resolves a primary end offset for canonical sorting.
   * @param diagnostic - Diagnostic to inspect.
   * @returns End offset, or negative one for whole-source context.
   */
  #spanEnd(diagnostic: SourceDiagnostic): number {
    return diagnostic.span?.end.offset ?? -1;
  }

  /**
   * @description Resolves the accepted severity order.
   * @param diagnostic - Diagnostic whose severity is ranked.
   * @returns Zero for errors and one for warnings.
   */
  #severityRank(diagnostic: SourceDiagnostic): number {
    return diagnostic.severity === diagnosticSeverities.error ? 0 : 1;
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text.
   * @param right - Second text.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
