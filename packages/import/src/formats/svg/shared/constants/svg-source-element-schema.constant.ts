import type { TSvgSourceElementName } from "../types/internal/svg-source-element-name.type.js";
import type { TSvgSourceElementRole } from "../types/internal/svg-source-element-role.type.js";
import { svgSourceAttributeNames } from "./svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "./svg-source-element-names.constant.js";
import { svgSourceElementRoles } from "./svg-source-element-roles.constant.js";

/**
 * @description Immutable accepted source-element roles and non-presentation attribute schema.
 */
export const svgSourceElementSchema = Object.freeze({
  /** @description Validation schema for the SVG root element. */
  [svgSourceElementNames.root]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.root,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([
      svgSourceAttributeNames.viewBox,
      svgSourceAttributeNames.namespaceDeclaration,
    ] as const),
  }),
  /** @description Validation schema for the SVG group element. */
  [svgSourceElementNames.group]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.structural,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([]),
  }),
  /** @description Validation schema for the SVG path element. */
  [svgSourceElementNames.path]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([svgSourceAttributeNames.pathData] as const),
  }),
  /** @description Validation schema for the SVG circle element. */
  [svgSourceElementNames.circle]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([
      svgSourceAttributeNames.centreX,
      svgSourceAttributeNames.centreY,
      svgSourceAttributeNames.radius,
    ] as const),
  }),
  /** @description Validation schema for the SVG ellipse element. */
  [svgSourceElementNames.ellipse]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([
      svgSourceAttributeNames.centreX,
      svgSourceAttributeNames.centreY,
      svgSourceAttributeNames.radiusX,
      svgSourceAttributeNames.radiusY,
    ] as const),
  }),
  /** @description Validation schema for the SVG rectangle element. */
  [svgSourceElementNames.rectangle]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([
      svgSourceAttributeNames.x,
      svgSourceAttributeNames.y,
      svgSourceAttributeNames.width,
      svgSourceAttributeNames.height,
      svgSourceAttributeNames.radiusX,
      svgSourceAttributeNames.radiusY,
    ] as const),
  }),
  /** @description Validation schema for the SVG line element. */
  [svgSourceElementNames.line]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([
      svgSourceAttributeNames.x1,
      svgSourceAttributeNames.y1,
      svgSourceAttributeNames.x2,
      svgSourceAttributeNames.y2,
    ] as const),
  }),
  /** @description Validation schema for the SVG polyline element. */
  [svgSourceElementNames.polyline]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([svgSourceAttributeNames.points] as const),
  }),
  /** @description Validation schema for the SVG polygon element. */
  [svgSourceElementNames.polygon]: Object.freeze({
    /** @description Structural role assigned to this accepted SVG element. */
    role: svgSourceElementRoles.primitive,
    /** @description Non-presentation attributes accepted for this SVG element. */
    attributes: Object.freeze([svgSourceAttributeNames.points] as const),
  }),
}) satisfies Readonly<
  Record<
    TSvgSourceElementName,
    Readonly<{
      /**
       * @description Structural responsibility assigned to the recognised source element.
       */
      readonly role: TSvgSourceElementRole;

      /**
       * @description Non-presentation attributes accepted for the source element.
       */
      readonly attributes: readonly string[];
    }>
  >
>;
