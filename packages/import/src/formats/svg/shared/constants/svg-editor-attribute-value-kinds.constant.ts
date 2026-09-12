/**
 * @description Immutable value families accepted by the finite SVG editor-attribute policy.
 */
export const svgEditorAttributeValueKinds = Object.freeze({
  /** @description Canonical editor attribute value kind for text values. */
  text: "text",
  /** @description Canonical editor attribute value kind for length values. */
  length: "length",
  /** @description Canonical editor attribute value kind for positive number values. */
  positiveNumber: "positive-number",
  /** @description Canonical editor attribute value kind for background values. */
  background: "background",
  /** @description Canonical editor attribute value kind for space values. */
  space: "space",
} as const);
