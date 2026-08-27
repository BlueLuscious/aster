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
    renderFailure: "render-failure",
    exportConflict: "export-conflict",
    outputConflict: "output-conflict",
    outputFailure: "output-failure",
    executionFailure: "execution-failure",
  } as const),
  codes: Object.freeze({
    usage: "ASTER-CLI-001",
    invalidContext: "ASTER-CLI-002",
    catalogueConflict: "ASTER-CLI-003",
    notFound: "ASTER-CLI-004",
    ambiguous: "ASTER-CLI-005",
    catalogueUnavailable: "ASTER-CLI-006",
    renderFailure: "ASTER-CLI-007",
    exportConflict: "ASTER-CLI-008",
    outputConflict: "ASTER-CLI-009",
    outputFailure: "ASTER-CLI-010",
    executionFailure: "ASTER-CLI-999",
  } as const),
});
