import type { DiagnosticCodeType } from "../diagnostic-code.type.js";

/**
 * @description Stable observable metadata resolved for one internal diagnostic family.
 * @remarks Category and severity derive from the code policy. Source identity, locations, and
 * related context remain occurrence-specific and are supplied separately.
 */
export type TDiagnosticDetails = {
  /**
   * @description Stable machine-readable identifier for the diagnostic family.
   */
  readonly code: DiagnosticCodeType;

  /**
   * @description Stable human-readable explanation of the diagnostic.
   */
  readonly message: string;
};
