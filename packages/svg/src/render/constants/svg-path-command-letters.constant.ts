import {
  iconPathCommandKinds,
  type IconPathCommandType,
} from "@aster/core";

/**
 * @description Immutable target-owned SVG letters for canonical portable path operations.
 */
export const svgPathCommandLetters = Object.freeze({
  /** @description Absolute contour movement letter. */
  [iconPathCommandKinds.move]: "M",
  /** @description Absolute straight-segment letter. */
  [iconPathCommandKinds.line]: "L",
  /** @description Absolute cubic Bezier letter. */
  [iconPathCommandKinds.cubicBezier]: "C",
  /** @description Absolute quadratic Bezier letter. */
  [iconPathCommandKinds.quadraticBezier]: "Q",
  /** @description Absolute elliptical-arc letter. */
  [iconPathCommandKinds.arc]: "A",
  /** @description Contour-closure letter. */
  [iconPathCommandKinds.close]: "Z",
} as const satisfies Readonly<Record<IconPathCommandType["kind"], string>>);
