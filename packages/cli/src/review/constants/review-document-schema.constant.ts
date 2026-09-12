/**
 * @description Immutable static review document identity and publication vocabulary.
 */
export const reviewDocumentSchema = Object.freeze({
  /** @description Embedded marker identifying an Aster-owned review document. */
  ownershipMarker: '<meta name="aster-review-document" content="1">',
  /** @description Fixed entry-document name used for static review publication. */
  fileName: "index.html",
} as const);
