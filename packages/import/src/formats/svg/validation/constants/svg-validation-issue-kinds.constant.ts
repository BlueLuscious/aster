/**
 * @description Immutable semantic issue families produced by technical SVG validation.
 */
export const svgValidationIssueKinds = Object.freeze({
  /** @description Stable validation issue kind for empty geometry evidence. */
  emptyGeometry: "empty-geometry",
  /** @description Stable validation issue kind for discarded editor attribute evidence. */
  discardedEditorAttribute: "discarded-editor-attribute",
  /** @description Stable validation issue kind for invalid geometry evidence. */
  invalidGeometry: "invalid-geometry",
  /** @description Stable validation issue kind for invalid path data evidence. */
  invalidPathData: "invalid-path-data",
  /** @description Stable validation issue kind for invalid presentation evidence. */
  invalidPresentation: "invalid-presentation",
  /** @description Stable validation issue kind for invalid viewBox evidence. */
  invalidViewBox: "invalid-view-box",
  /** @description Stable validation issue kind for unsupported attribute evidence. */
  unsupportedAttribute: "unsupported-attribute",
} as const);
