import type { TOutputLocation } from "./output-location.type.js";

/**
 * @description Resolved roots and document paths for one static review publication.
 */
export type TReviewOutputLocation = TOutputLocation & Readonly<{
  /**
   * @description Absolute private sibling retaining the previous owned review during replacement.
   */
  backupRoot: string;

  /**
   * @description Existing target document inspected for Aster ownership.
   */
  targetDocument: string;

  /**
   * @description Private staged document written before publication.
   */
  stageDocument: string;
}>;
