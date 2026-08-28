/**
 * @description Immutable value families accepted by the finite SVG editor-attribute policy.
 */
export const svgEditorAttributeValueKinds = Object.freeze({
  text: "text",
  length: "length",
  positiveNumber: "positive-number",
  background: "background",
  space: "space",
} as const);
