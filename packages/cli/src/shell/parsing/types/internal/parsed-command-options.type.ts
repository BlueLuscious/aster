/**
 * @description Mutable command-specific options accumulated while parsing one argv sequence.
 */
export type TParsedCommandOptions = {
  /**
   * @description Optional exact catalogue-provider filter.
   */
  catalogue?: string;

  /**
   * @description Optional exact collection-identity filter.
   */
  collection?: string;

  /**
   * @description Repeated intrinsic-tag filters in received order.
   */
  tags: string[];
};
