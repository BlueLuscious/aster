/**
 * @description Immutable evidence returned after one static review publication.
 */
export type TReviewOutputPublication = Readonly<{
  /**
   * @description Absolute committed review root.
   */
  targetRoot: string;

  /**
   * @description Whether one previously owned review was replaced.
   */
  replaced: boolean;
}>;
