/**
 * @description Immutable categories and codes for structured command diagnostics.
 */
export const commandDiagnosticSchema = Object.freeze({
  categories: Object.freeze({
    usage: "usage",
    notFound: "not-found",
    ambiguous: "ambiguous",
    catalogueConflict: "catalogue-conflict",
    catalogueUnavailable: "catalogue-unavailable",
    executionFailure: "execution-failure",
  } as const),
  codes: Object.freeze({
    usage: "ASTER-CLI-001",
    invalidContext: "ASTER-CLI-002",
    catalogueConflict: "ASTER-CLI-003",
    notFound: "ASTER-CLI-004",
    ambiguous: "ASTER-CLI-005",
    catalogueUnavailable: "ASTER-CLI-006",
    executionFailure: "ASTER-CLI-999",
  } as const),
});
