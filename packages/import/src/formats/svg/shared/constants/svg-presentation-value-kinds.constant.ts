/**
 * @description Immutable value families supported by portable SVG presentation attributes.
 */
export const svgPresentationValueKinds = Object.freeze({
  /** @description Canonical presentation value kind for paint values. */
  paint: "paint",
  /** @description Canonical presentation value kind for enumeration values. */
  enumeration: "enumeration",
  /** @description Canonical presentation value kind for number values. */
  number: "number",
} as const);
