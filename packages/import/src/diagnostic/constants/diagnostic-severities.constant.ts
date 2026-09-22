/**
 * @description Immutable diagnostic authority levels accepted by Import.
 */
export const diagnosticSeverities = Object.freeze({
  /** @description Canonical severity for error diagnostics. */
  error: "error",
  /** @description Canonical severity for warning diagnostics. */
  warning: "warning",
} as const);
