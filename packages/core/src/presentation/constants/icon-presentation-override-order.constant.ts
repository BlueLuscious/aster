import type { IconPresentationOverrideType } from "../types/index.js";

/**
 * @description Canonical semantic order for caller-overridable presentation capabilities.
 */
export const iconPresentationOverrideOrder = Object.freeze([
  "fill",
  "stroke",
  "strokeWidth",
] as const satisfies readonly IconPresentationOverrideType[]);
