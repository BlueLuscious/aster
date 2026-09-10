import type {
  CollectionIdentity,
  CollectionMetadata,
} from "@aster/core";
import type { reviewSubjects } from "../constants/review-subjects.constant.js";
import type { AsterReviewIconEvidence } from "./aster-review-icon-evidence.contract.js";

/**
 * @description Complete technical review model for one exact collection.
 */
export interface AsterCollectionReviewDocument {
  /**
   * @description Discriminator for one collection review document.
   */
  readonly kind: typeof reviewSubjects.collection;

  /**
   * @description Stable portable collection identity.
   */
  readonly identity: CollectionIdentity;

  /**
   * @description Complete accepted portable collection metadata.
   */
  readonly metadata: CollectionMetadata;

  /**
   * @description Canonically ordered complete member evidence.
   */
  readonly icons: readonly AsterReviewIconEvidence[];
}
