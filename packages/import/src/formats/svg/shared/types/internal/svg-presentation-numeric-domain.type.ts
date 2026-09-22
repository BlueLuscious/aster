import type { svgNumericDomains } from "../../constants/svg-numeric-domains.constant.js";
import type { TSvgNumericDomain } from "./svg-numeric-domain.type.js";

/**
 * @description Internal numeric domain accepted by portable SVG presentation attributes.
 */
export type TSvgPresentationNumericDomain = Exclude<
  TSvgNumericDomain,
  typeof svgNumericDomains.finite
>;
