import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";

/**
 * @description Immutable attribute-name and value policies used to reject active SVG capabilities.
 */
export const svgSafetyAttributePolicy = Object.freeze({
  eventHandlerPatternSource: String.raw`^on`,
  resourceNames: Object.freeze([
    svgSourceAttributeNames.href,
    svgSourceAttributeNames.source,
  ] as const),
  valueReferencePatternSource: String.raw`url\s*\(`,
});
