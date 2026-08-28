import type { SourceSpan } from "../../../../../diagnostic/contracts/index.js";

/**
 * @description One parsed finite source number and its trustworthy authored evidence.
 */
export type TLocatedNumber = {
  /**
   * @description Parsed finite numeric value.
   */
  readonly value: number;

  /**
   * @description Exact attribute-value span containing the number.
   */
  readonly span: SourceSpan;
};
