/**
 * @description Immutable accepted values for every enumerated portable presentation field.
 */
export const iconPresentationEnumerations = Object.freeze({
  /** @description Closed portable interior-fill algorithms. */
  fillRule: Object.freeze(["nonzero", "evenodd"] as const),
  /** @description Closed portable stroke endpoint shapes. */
  strokeLineCap: Object.freeze(["butt", "round", "square"] as const),
  /** @description Closed portable stroke corner shapes. */
  strokeLineJoin: Object.freeze(["miter", "round", "bevel"] as const),
});
