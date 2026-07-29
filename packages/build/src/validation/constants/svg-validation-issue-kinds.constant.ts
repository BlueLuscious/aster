/**
 * @description Immutable semantic issue families produced by technical and collection SVG validation.
 */
export const svgValidationIssueKinds = Object.freeze({
  duplicateIdentity: "duplicate-identity",
  emptyGeometry: "empty-geometry",
  identityDisagreement: "identity-disagreement",
  invalidGeometry: "invalid-geometry",
  invalidPathData: "invalid-path-data",
  invalidPresentation: "invalid-presentation",
  invalidViewBox: "invalid-view-box",
  unsupportedAttribute: "unsupported-attribute",
  collectionBounds: "collection-bounds",
  collectionComplexity: "collection-complexity",
  collectionGrid: "collection-grid",
  collectionStroke: "collection-stroke",
  collectionViewBox: "collection-view-box",
} as const);
