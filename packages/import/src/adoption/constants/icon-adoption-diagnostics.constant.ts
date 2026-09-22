import { diagnosticCodes } from "../../diagnostic/constants/diagnostic-codes.constant.js";

/**
 * @description Stable diagnostics owned by the icon adoption boundary.
 */
export const iconAdoptionDiagnostics = Object.freeze({
  /** @description Stable adoption diagnostic for invalid definition failures. */
  invalidDefinition: Object.freeze({
    /** @description Stable Aster diagnostic code for this adoption failure. */
    code: diagnosticCodes.invalidDefinition,
    /** @description Stable diagnostic message for this adoption failure. */
    message: "The imported draft and reviewed metadata do not form a valid icon definition.",
  }),
  /** @description Stable adoption diagnostic for invalid emission failures. */
  invalidEmission: Object.freeze({
    /** @description Stable Aster diagnostic code for this adoption failure. */
    code: diagnosticCodes.invalidEmission,
    /** @description Stable diagnostic message for this adoption failure. */
    message: "The icon definition cannot be emitted as an editable TypeScript module.",
  }),
  /** @description Stable adoption diagnostic for duplicate identity failures. */
  duplicateIdentity: Object.freeze({
    /** @description Stable Aster diagnostic code for this adoption failure. */
    code: diagnosticCodes.duplicateIdentity,
    /** @description Stable diagnostic message for this adoption failure. */
    message: "The adoption batch contains a duplicate icon identity.",
  }),
  /** @description Stable adoption diagnostic for duplicate symbol failures. */
  duplicateSymbol: Object.freeze({
    /** @description Stable Aster diagnostic code for this adoption failure. */
    code: diagnosticCodes.duplicateSymbol,
    /** @description Stable diagnostic message for this adoption failure. */
    message: "The adoption batch contains definitions with the same exported symbol.",
  }),
} as const);
