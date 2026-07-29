import type { diagnosticSeverities } from "../constants/diagnostic-severities.constant.js";

/**
 * @description Closed authority levels carried by build diagnostics.
 */
export type DiagnosticSeverityType =
  (typeof diagnosticSeverities)[keyof typeof diagnosticSeverities];
