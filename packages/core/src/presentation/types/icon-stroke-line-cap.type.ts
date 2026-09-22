import type { iconPresentationEnumerations } from "../constants/icon-presentation-enumerations.constant.js";

/**
 * @description Portable stroke endpoint shape using exact SVG token spelling.
 */
export type IconStrokeLineCapType =
  (typeof iconPresentationEnumerations.strokeLineCap)[number];
