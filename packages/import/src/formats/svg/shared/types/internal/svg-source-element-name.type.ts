import type { svgSourceElementNames } from "../../constants/svg-source-element-names.constant.js";

/**
 * @description Internal closed name of an SVG element recognised by the portable source subset.
 */
export type TSvgSourceElementName =
  (typeof svgSourceElementNames)[keyof typeof svgSourceElementNames];
