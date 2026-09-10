/**
 * @description Immutable static review document identity and publication vocabulary.
 */
export const reviewDocumentSchema = Object.freeze({
  ownershipMarker: '<meta name="aster-review-document" content="1">',
  fileName: "index.html",
} as const);
