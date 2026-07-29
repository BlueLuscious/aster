import type { DiagnosticResultType } from "../types/index.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { SourceDiagnosticAggregator } from "./source-diagnostic.aggregator.js";

/**
 * @description Creates immutable success and failure results without host process authority.
 */
export class DiagnosticResultFactory {
  /**
   * @description Canonical diagnostic aggregation authority.
   */
  readonly #aggregator = new SourceDiagnosticAggregator();

  /**
   * @description Creates one successful result carrying warnings or no diagnostics.
   * @typeParam Value - Successful domain output.
   * @param value - Successful output.
   * @param diagnostics - Advisory diagnostic values.
   * @returns Frozen successful diagnostic-bearing result.
   */
  success<Value>(
    value: Value,
    diagnostics: readonly unknown[] = [],
  ): DiagnosticResultType<Value> {
    const canonical = this.#aggregator.aggregate(diagnostics);

    if (canonical.some((diagnostic) => diagnostic.severity === "error")) {
      throw new BuildContractError(
        "diagnostics",
        "successful results cannot contain errors",
      );
    }

    return Object.freeze({
      successful: true,
      value,
      diagnostics: canonical,
    });
  }

  /**
   * @description Creates one failed result carrying at least one blocking diagnostic and no value.
   * @typeParam Value - Successful output type intentionally absent from failure.
   * @param diagnostics - Diagnostic values including a blocking error.
   * @returns Frozen failed diagnostic-bearing result.
   */
  failure<Value>(
    diagnostics: readonly unknown[],
  ): DiagnosticResultType<Value> {
    const canonical = this.#aggregator.aggregate(diagnostics);

    if (!canonical.some((diagnostic) => diagnostic.severity === "error")) {
      throw new BuildContractError(
        "diagnostics",
        "failed results require at least one error",
      );
    }

    return Object.freeze({
      successful: false,
      diagnostics: canonical,
    });
  }
}
