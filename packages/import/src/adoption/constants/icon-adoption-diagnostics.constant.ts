import { diagnosticCodes } from "../../diagnostic/constants/diagnostic-codes.constant.js";

/**
 * @description Stable diagnostics owned by the icon adoption boundary.
 */
export const iconAdoptionDiagnostics = Object.freeze({
  invalidDefinition: Object.freeze({
    code: diagnosticCodes.invalidDefinition,
    message: "The imported draft and reviewed metadata do not form a valid icon definition.",
  }),
  invalidEmission: Object.freeze({
    code: diagnosticCodes.invalidEmission,
    message: "The icon definition cannot be emitted as an editable TypeScript module.",
  }),
  duplicateIdentity: Object.freeze({
    code: diagnosticCodes.duplicateIdentity,
    message: "The adoption batch contains a duplicate icon identity.",
  }),
  duplicateSymbol: Object.freeze({
    code: diagnosticCodes.duplicateSymbol,
    message: "The adoption batch contains definitions with the same exported symbol.",
  }),
} as const);
