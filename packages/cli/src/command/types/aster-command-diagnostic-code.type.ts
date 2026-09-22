import type { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";

/**
 * @description Stable Aster-owned identifier accepted by command diagnostics.
 */
export type AsterCommandDiagnosticCodeType =
  (typeof commandDiagnosticSchema.codes)[keyof typeof commandDiagnosticSchema.codes];
