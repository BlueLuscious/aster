import type { svgNumericDomains } from "../../../shared/constants/svg-numeric-domains.constant.js";
import type { TSvgNumericDomain } from "../../../shared/types/internal/svg-numeric-domain.type.js";

/**
 * @description Internal numeric domain accepted by SVG geometry attributes.
 */
export type TSvgGeometryNumericDomain = Exclude<
  TSvgNumericDomain,
  typeof svgNumericDomains.opacity
>;
