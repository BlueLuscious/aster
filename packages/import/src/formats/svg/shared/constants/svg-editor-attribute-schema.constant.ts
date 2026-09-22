import { svgSourceAttributeNames } from "./svg-source-attribute-names.constant.js";
import { svgEditorAttributeValueKinds } from "./svg-editor-attribute-value-kinds.constant.js";

/**
 * @description Finite root-only SVG editor attributes that may be reviewed and discarded.
 */
export const svgEditorAttributeSchema = Object.freeze({
  /** @description Validation schema for the SVG version editor attribute. */
  [svgSourceAttributeNames.version]: svgEditorAttributeValueKinds.text,
  /** @description Validation schema for the SVG identifier editor attribute. */
  [svgSourceAttributeNames.identifier]: svgEditorAttributeValueKinds.text,
  /** @description Validation schema for the SVG x editor attribute. */
  [svgSourceAttributeNames.x]: svgEditorAttributeValueKinds.length,
  /** @description Validation schema for the SVG y editor attribute. */
  [svgSourceAttributeNames.y]: svgEditorAttributeValueKinds.length,
  /** @description Validation schema for the SVG width editor attribute. */
  [svgSourceAttributeNames.width]: svgEditorAttributeValueKinds.positiveNumber,
  /** @description Validation schema for the SVG height editor attribute. */
  [svgSourceAttributeNames.height]: svgEditorAttributeValueKinds.positiveNumber,
  /** @description Validation schema for the SVG enable background editor attribute. */
  [svgSourceAttributeNames.enableBackground]: svgEditorAttributeValueKinds.background,
  /** @description Validation schema for the SVG space editor attribute. */
  [svgSourceAttributeNames.space]: svgEditorAttributeValueKinds.space,
} as const);
