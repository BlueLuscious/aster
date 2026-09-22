import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";

/**
 * @description Immutable attribute-name and value policies used to reject active SVG capabilities.
 */
export const svgSafetyAttributePolicy = Object.freeze({
  /** @description Safety policy authority for event handler pattern source. */
  eventHandlerPatternSource: String.raw`^on`,
  /** @description Safety policy authority for resource names. */
  resourceNames: Object.freeze([
    svgSourceAttributeNames.href,
    svgSourceAttributeNames.source,
  ] as const),
  /** @description Safety policy authority for value reference pattern source. */
  valueReferencePatternSource: String.raw`url\s*\(`,
});
