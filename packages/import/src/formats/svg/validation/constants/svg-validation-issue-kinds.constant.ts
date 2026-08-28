/**
 * @description Immutable semantic issue families produced by technical SVG validation.
 */
export const svgValidationIssueKinds = Object.freeze({
  emptyGeometry: "empty-geometry",
  discardedEditorAttribute: "discarded-editor-attribute",
  invalidGeometry: "invalid-geometry",
  invalidPathData: "invalid-path-data",
  invalidPresentation: "invalid-presentation",
  invalidViewBox: "invalid-view-box",
  unsupportedAttribute: "unsupported-attribute",
} as const);
