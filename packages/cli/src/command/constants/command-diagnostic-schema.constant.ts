/**
 * @description Immutable categories and codes for structured command diagnostics.
 */
export const commandDiagnosticSchema = Object.freeze({
  /** @description Closed semantic categories assigned to command diagnostics. */
  categories: Object.freeze({
    /** @description Invalid command invocation or option usage. */
    usage: "usage",
    /** @description Requested catalogue value was not found. */
    notFound: "not-found",
    /** @description Requested catalogue value matched more than one provider. */
    ambiguous: "ambiguous",
    /** @description Catalogue providers made conflicting ownership claims. */
    catalogueConflict: "catalogue-conflict",
    /** @description Catalogue provider or its data could not be accepted. */
    catalogueUnavailable: "catalogue-unavailable",
    /** @description Portable definition could not be rendered. */
    renderFailure: "render-failure",
    /** @description Export planning could not produce a valid artefact set. */
    exportConflict: "export-conflict",
    /** @description Requested output location conflicts with existing content. */
    outputConflict: "output-conflict",
    /** @description Output host could not complete publication. */
    outputFailure: "output-failure",
    /** @description Unexpected command execution failure. */
    executionFailure: "execution-failure",
  } as const),
  /** @description Closed stable codes assigned to command failure families. */
  codes: Object.freeze({
    /** @description Stable code for invalid command usage. */
    usage: "ASTER-CLI-001",
    /** @description Stable code for an invalid execution context. */
    invalidContext: "ASTER-CLI-002",
    /** @description Stable code for conflicting catalogue claims. */
    catalogueConflict: "ASTER-CLI-003",
    /** @description Stable code for an unavailable requested value. */
    notFound: "ASTER-CLI-004",
    /** @description Stable code for an ambiguous requested value. */
    ambiguous: "ASTER-CLI-005",
    /** @description Stable code for an unavailable catalogue provider. */
    catalogueUnavailable: "ASTER-CLI-006",
    /** @description Stable code for a rendering failure. */
    renderFailure: "ASTER-CLI-007",
    /** @description Stable code for conflicting export artefacts. */
    exportConflict: "ASTER-CLI-008",
    /** @description Stable code for an existing output conflict. */
    outputConflict: "ASTER-CLI-009",
    /** @description Stable code for an output-host operation failure. */
    outputFailure: "ASTER-CLI-010",
    /** @description Stable terminal code for an unexpected execution failure. */
    executionFailure: "ASTER-CLI-999",
  } as const),
});
