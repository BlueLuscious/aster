/**
 * @description Immutable discriminators for every supported portable path command.
 */
export const iconPathCommandKinds = Object.freeze({
  /** @description Starts one contour at an absolute coordinate. */
  move: "move",
  /** @description Draws one straight segment to an absolute coordinate. */
  line: "line",
  /** @description Draws one cubic Bezier segment to an absolute coordinate. */
  cubicBezier: "cubic-bezier",
  /** @description Draws one quadratic Bezier segment to an absolute coordinate. */
  quadraticBezier: "quadratic-bezier",
  /** @description Draws one elliptical arc segment to an absolute coordinate. */
  arc: "arc",
  /** @description Closes the current contour. */
  close: "close",
} as const);
