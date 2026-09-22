import type { iconAdoptionDiagnostics } from "../../constants/icon-adoption-diagnostics.constant.js";

/**
 * @description Stable code and message authority for one adoption diagnostic family.
 */
export type TIconAdoptionDiagnosticDetails =
  (typeof iconAdoptionDiagnostics)[keyof typeof iconAdoptionDiagnostics];
