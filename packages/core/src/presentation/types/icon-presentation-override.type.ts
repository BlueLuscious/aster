import type { iconPresentationOverrideOrder } from "../constants/icon-presentation-override-order.constant.js";

/**
 * @description Presentation capability that an icon policy permits callers to override.
 */
export type IconPresentationOverrideType =
  (typeof iconPresentationOverrideOrder)[number];
