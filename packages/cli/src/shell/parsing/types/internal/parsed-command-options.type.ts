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

  /** @description Optional exact glyph identity filter for icon listing. */
  glyph?: string;

  /**
   * @description Repeated intrinsic-tag filters in received order.
   */
  tags: string[];
};
