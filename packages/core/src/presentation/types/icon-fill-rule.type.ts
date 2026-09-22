import type { iconPresentationEnumerations } from "../constants/icon-presentation-enumerations.constant.js";

/**
 * @description Portable fill algorithm using exact SVG token spelling.
 */
export type IconFillRuleType =
  (typeof iconPresentationEnumerations.fillRule)[number];
