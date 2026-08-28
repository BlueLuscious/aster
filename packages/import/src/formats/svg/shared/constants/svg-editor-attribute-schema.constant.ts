import { svgSourceAttributeNames } from "./svg-source-attribute-names.constant.js";
import { svgEditorAttributeValueKinds } from "./svg-editor-attribute-value-kinds.constant.js";

/**
 * @description Finite root-only SVG editor attributes that may be reviewed and discarded.
 */
export const svgEditorAttributeSchema = Object.freeze({
  [svgSourceAttributeNames.version]: svgEditorAttributeValueKinds.text,
  [svgSourceAttributeNames.identifier]: svgEditorAttributeValueKinds.text,
  [svgSourceAttributeNames.x]: svgEditorAttributeValueKinds.length,
  [svgSourceAttributeNames.y]: svgEditorAttributeValueKinds.length,
  [svgSourceAttributeNames.width]: svgEditorAttributeValueKinds.positiveNumber,
  [svgSourceAttributeNames.height]: svgEditorAttributeValueKinds.positiveNumber,
  [svgSourceAttributeNames.enableBackground]: svgEditorAttributeValueKinds.background,
  [svgSourceAttributeNames.space]: svgEditorAttributeValueKinds.space,
} as const);
