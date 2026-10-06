/**
 * @description Mutable export-specific argv values before portable option validation.
 */
export type TParsedExportCommandOptions = {
  /**
   * @description Optional exact catalogue-provider filter.
   */
  catalogue?: string;

  /**
   * @description Optional shell-owned output root excluded from structured invocation.
   */
  output?: string;

  /**
   * @description Optional finite dimension awaiting portable domain validation.
   */
  size?: number;

  /**
   * @description Optional unvalidated inherited colour token.
   */
  colour?: string;

  /**
   * @description Optional unvalidated fill paint token.
   */
  fill?: string;

  /**
   * @description Optional unvalidated stroke paint token.
   */
  stroke?: string;

  /**
   * @description Optional finite stroke width awaiting portable domain validation.
   */
  strokeWidth?: number;

  /**
   * @description Optional unvalidated direction token.
   */
  direction?: string;

  /**
   * @description Optional icon-only accessible label.
   */
  label?: string;

  /**
   * @description Optional icon-only accessible title.
   */
  title?: string;
};
