import type { DiagnosticSeverityType } from "../types/diagnostic-severity.type.js";

/**
 * @description Immutable diagnostic authority levels accepted by the build boundary.
 */
export const diagnosticSeverities = Object.freeze([
  "error",
  "warning",
] as const satisfies readonly DiagnosticSeverityType[]);
