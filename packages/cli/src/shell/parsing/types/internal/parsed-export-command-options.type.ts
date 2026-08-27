import type {
  IconDirectionType,
  IconPaintType,
} from "@aster/core";

/**
 * @description Mutable export-specific options accumulated from one standalone argv sequence.
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
   * @description Optional positive rendered dimension.
   */
  size?: number;

  /**
   * @description Optional inherited portable colour.
   */
  colour?: IconPaintType;

  /**
   * @description Optional explicit portable fill paint.
   */
  fill?: IconPaintType;

  /**
   * @description Optional explicit portable stroke paint.
   */
  stroke?: IconPaintType;

  /**
   * @description Optional non-negative rendered stroke width.
   */
  strokeWidth?: number;

  /**
   * @description Optional explicit rendered direction.
   */
  direction?: IconDirectionType;

  /**
   * @description Optional icon-only accessible label.
   */
  label?: string;

  /**
   * @description Optional icon-only accessible title.
   */
  title?: string;
};
