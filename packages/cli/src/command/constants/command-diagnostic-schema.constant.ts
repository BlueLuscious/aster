/**
 * @description Immutable categories, codes and supporting-detail roles for command diagnostics.
 */
export const commandDiagnosticSchema = Object.freeze({
  /** @description Closed semantic roles carried by supporting diagnostic details. */
  details: Object.freeze({
    /** @description Complete received provider claims, including repeated identities. */
    catalogues: "catalogues",
    /** @description One provider whose metadata could not be accepted. */
    catalogue: "catalogue",
    /** @description Explicit subject and identity requested by an unsuccessful lookup. */
    lookup: "lookup",
    /** @description Requested subject and its distinct candidate providers. */
    ambiguity: "ambiguity",
    /** @description Selected definition and its provider, with an optional failing collection member. */
    definition: "definition",
    /** @description Logical artefact path whose SVG rendering failed. */
    exportRender: "export-render",
    /** @description Concrete icon whose review rendering failed. */
    reviewRender: "review-render",
    /** @description Logical artefact path claimed by multiple selected definitions. */
    pathConflict: "path-conflict",
  } as const),
  /** @description Diagnostic lookup subject not addressed by an exact show invocation. */
  catalogueSubject: "catalogue",
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
    /** @description Requested package versions could not be acquired from their stated source. */
    versionUnavailable: "version-unavailable",
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
    /** @description Stable code for unavailable project or executed-CLI package versions. */
    versionUnavailable: "ASTER-CLI-011",
    /** @description Stable terminal code for an unexpected execution failure. */
    executionFailure: "ASTER-CLI-999",
  } as const),
});
