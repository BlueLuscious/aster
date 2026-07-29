/**
 * @description Immutable accepted values for every enumerated portable presentation field.
 */
export const iconPresentationEnumerations = Object.freeze({
  fillRule: Object.freeze(["nonzero", "evenodd"] as const),
  strokeLineCap: Object.freeze(["butt", "round", "square"] as const),
  strokeLineJoin: Object.freeze(["miter", "round", "bevel"] as const),
});
