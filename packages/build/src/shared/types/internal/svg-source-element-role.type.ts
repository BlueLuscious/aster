import type { svgSourceElementRoles } from "../../constants/svg-source-element-roles.constant.js";

/**
 * @description Internal structural role assigned to a recognised SVG source element.
 */
export type TSvgSourceElementRole =
  (typeof svgSourceElementRoles)[keyof typeof svgSourceElementRoles];
