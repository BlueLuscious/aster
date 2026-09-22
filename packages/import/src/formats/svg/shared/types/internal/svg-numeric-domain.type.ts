import type { svgNumericDomains } from "../../constants/svg-numeric-domains.constant.js";

/**
 * @description Internal numeric domain enforced by portable SVG presentation validation.
 */
export type TSvgNumericDomain =
  (typeof svgNumericDomains)[keyof typeof svgNumericDomains];
