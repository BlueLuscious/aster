import type { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";

/**
 * @description Stable responsibility family accepted by command diagnostics.
 */
export type AsterCommandDiagnosticCategoryType =
  (typeof commandDiagnosticSchema.categories)[keyof typeof commandDiagnosticSchema.categories];
