/**
 * @description Immutable stable diagnostic codes emitted by Import operations.
 */
export const diagnosticCodes = Object.freeze({
  /** @description Stable diagnostic code for malformed document evidence. */
  malformedDocument: "ASTER-SYNTAX-001",
  /** @description Stable diagnostic code for invalid viewBox evidence. */
  invalidViewBox: "ASTER-SYNTAX-002",
  /** @description Stable diagnostic code for invalid geometry evidence. */
  invalidGeometry: "ASTER-SYNTAX-003",
  /** @description Stable diagnostic code for invalid path data evidence. */
  invalidPathData: "ASTER-SYNTAX-004",
  /** @description Stable diagnostic code for invalid presentation evidence. */
  invalidPresentation: "ASTER-SYNTAX-005",
  /** @description Stable diagnostic code for doctype evidence. */
  doctype: "ASTER-SAFETY-001",
  /** @description Stable diagnostic code for entity reference evidence. */
  entityReference: "ASTER-SAFETY-002",
  /** @description Stable diagnostic code for executable element evidence. */
  executableElement: "ASTER-SAFETY-003",
  /** @description Stable diagnostic code for raster or embedded element evidence. */
  rasterOrEmbeddedElement: "ASTER-SAFETY-004",
  /** @description Stable diagnostic code for event handler evidence. */
  eventHandler: "ASTER-SAFETY-005",
  /** @description Stable diagnostic code for resource reference evidence. */
  resourceReference: "ASTER-SAFETY-006",
  /** @description Stable diagnostic code for foreign namespace evidence. */
  foreignNamespace: "ASTER-SAFETY-007",
  /** @description Stable diagnostic code for processing instruction evidence. */
  processingInstruction: "ASTER-SAFETY-008",
  /** @description Stable diagnostic code for parser limit evidence. */
  parserLimit: "ASTER-SAFETY-009",
  /** @description Stable diagnostic code for unsupported element evidence. */
  unsupportedElement: "ASTER-TECHNICAL-001",
  /** @description Stable diagnostic code for unsupported transform evidence. */
  unsupportedTransform: "ASTER-TECHNICAL-002",
  /** @description Stable diagnostic code for unsupported text evidence. */
  unsupportedText: "ASTER-TECHNICAL-003",
  /** @description Stable diagnostic code for unsupported CDATA evidence. */
  unsupportedCdata: "ASTER-TECHNICAL-004",
  /** @description Stable diagnostic code for unsupported attribute evidence. */
  unsupportedAttribute: "ASTER-TECHNICAL-005",
  /** @description Stable diagnostic code for empty geometry evidence. */
  emptyGeometry: "ASTER-TECHNICAL-006",
  /** @description Stable diagnostic code for discarded editor attribute evidence. */
  discardedEditorAttribute: "ASTER-TECHNICAL-007",
  /** @description Stable diagnostic code for invalid definition evidence. */
  invalidDefinition: "ASTER-ADOPTION-001",
  /** @description Stable diagnostic code for invalid emission evidence. */
  invalidEmission: "ASTER-ADOPTION-002",
  /** @description Stable diagnostic code for duplicate identity evidence. */
  duplicateIdentity: "ASTER-ADOPTION-003",
  /** @description Stable diagnostic code for duplicate symbol evidence. */
  duplicateSymbol: "ASTER-ADOPTION-004",
} as const);
