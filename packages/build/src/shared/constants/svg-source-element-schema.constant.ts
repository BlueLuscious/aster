import type { TSvgSourceElementName } from "../types/internal/svg-source-element-name.type.js";
import type { TSvgSourceElementRole } from "../types/internal/svg-source-element-role.type.js";
import { svgSourceAttributeNames } from "./svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "./svg-source-element-names.constant.js";
import { svgSourceElementRoles } from "./svg-source-element-roles.constant.js";

/**
 * @description Immutable accepted source-element roles and non-presentation attribute schema.
 */
export const svgSourceElementSchema = Object.freeze({
  [svgSourceElementNames.root]: Object.freeze({
    role: svgSourceElementRoles.root,
    attributes: Object.freeze([
      svgSourceAttributeNames.viewBox,
      svgSourceAttributeNames.namespaceDeclaration,
    ] as const),
  }),
  [svgSourceElementNames.group]: Object.freeze({
    role: svgSourceElementRoles.structural,
    attributes: Object.freeze([]),
  }),
  [svgSourceElementNames.path]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([svgSourceAttributeNames.pathData] as const),
  }),
  [svgSourceElementNames.circle]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([
      svgSourceAttributeNames.centreX,
      svgSourceAttributeNames.centreY,
      svgSourceAttributeNames.radius,
    ] as const),
  }),
  [svgSourceElementNames.ellipse]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([
      svgSourceAttributeNames.centreX,
      svgSourceAttributeNames.centreY,
      svgSourceAttributeNames.radiusX,
      svgSourceAttributeNames.radiusY,
    ] as const),
  }),
  [svgSourceElementNames.rectangle]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([
      svgSourceAttributeNames.x,
      svgSourceAttributeNames.y,
      svgSourceAttributeNames.width,
      svgSourceAttributeNames.height,
      svgSourceAttributeNames.radiusX,
      svgSourceAttributeNames.radiusY,
    ] as const),
  }),
  [svgSourceElementNames.line]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([
      svgSourceAttributeNames.x1,
      svgSourceAttributeNames.y1,
      svgSourceAttributeNames.x2,
      svgSourceAttributeNames.y2,
    ] as const),
  }),
  [svgSourceElementNames.polyline]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([svgSourceAttributeNames.points] as const),
  }),
  [svgSourceElementNames.polygon]: Object.freeze({
    role: svgSourceElementRoles.primitive,
    attributes: Object.freeze([svgSourceAttributeNames.points] as const),
  }),
}) satisfies Readonly<
  Record<
    TSvgSourceElementName,
    Readonly<{
      readonly role: TSvgSourceElementRole;
      readonly attributes: readonly string[];
    }>
  >
>;
