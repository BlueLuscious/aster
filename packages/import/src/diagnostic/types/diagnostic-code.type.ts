import type { diagnosticCodes } from "../constants/diagnostic-codes.constant.js";

/**
 * @description Closed stable Aster-owned diagnostic identifiers emitted by Import.
 */
export type DiagnosticCodeType =
  (typeof diagnosticCodes)[keyof typeof diagnosticCodes];
