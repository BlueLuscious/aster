/**
 * @description Stable diagnostics owned by the icon adoption boundary.
 */
export const iconAdoptionDiagnostics = Object.freeze({
  invalidDefinition: Object.freeze({
    code: "ASTER-ADOPTION-001",
    message: "The imported draft and reviewed metadata do not form a valid icon definition.",
  }),
  invalidEmission: Object.freeze({
    code: "ASTER-ADOPTION-002",
    message: "The icon definition cannot be emitted as an editable TypeScript module.",
  }),
  duplicateIdentity: Object.freeze({
    code: "ASTER-ADOPTION-003",
    message: "The adoption batch contains a duplicate icon identity.",
  }),
  duplicateSymbol: Object.freeze({
    code: "ASTER-ADOPTION-004",
    message: "The adoption batch contains definitions with the same exported symbol.",
  }),
} as const);
