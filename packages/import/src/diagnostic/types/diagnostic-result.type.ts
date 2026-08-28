import type { SourceDiagnostic } from "../contracts/index.js";

/**
 * @description Immutable diagnostic-bearing envelope returned by host-independent Import services.
 * @remarks The producing stage owns the immutability of `Value`; this result freezes its envelope
 * and canonical diagnostic sequence without mutating generic output.
 * @typeParam Value - Successful domain output.
 */
export type DiagnosticResultType<Value> =
  | {
      /**
       * @description Indicates that a complete accepted output is available.
       */
      readonly successful: true;

      /**
       * @description Complete accepted domain output.
       */
      readonly value: Value;

      /**
       * @description Deterministically ordered advisory diagnostics.
       */
      readonly diagnostics: readonly SourceDiagnostic[];
    }
  | {
      /**
       * @description Indicates that blocking diagnostics prevented accepted output.
       */
      readonly successful: false;

      /**
       * @description Deterministically ordered diagnostics including at least one error.
       */
      readonly diagnostics: readonly SourceDiagnostic[];
    };
