/**
 * @description Immutable value families supported by portable SVG presentation attributes.
 */
export const svgPresentationValueKinds = Object.freeze({
  paint: "paint",
  enumeration: "enumeration",
  number: "number",
} as const);
