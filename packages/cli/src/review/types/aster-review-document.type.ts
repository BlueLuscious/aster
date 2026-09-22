import type {
  AsterCollectionReviewDocument,
  AsterIconReviewDocument,
} from "../contracts/index.js";

/**
 * @description Closed immutable technical document model produced by review planning.
 */
export type AsterReviewDocumentType =
  | AsterIconReviewDocument
  | AsterCollectionReviewDocument;
