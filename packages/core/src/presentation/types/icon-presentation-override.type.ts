import type { iconPresentationOverrideOrder } from "../constants/icon-presentation-override-order.constant.js";

/**
 * @description Presentation capability that collection policy permits callers to override.
 */
export type IconPresentationOverrideType =
  (typeof iconPresentationOverrideOrder)[number];
