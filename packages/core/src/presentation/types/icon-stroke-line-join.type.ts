import type { iconPresentationEnumerations } from "../constants/icon-presentation-enumerations.constant.js";

/**
 * @description Portable stroke corner shape using exact SVG token spelling.
 */
export type IconStrokeLineJoinType =
  (typeof iconPresentationEnumerations.strokeLineJoin)[number];
