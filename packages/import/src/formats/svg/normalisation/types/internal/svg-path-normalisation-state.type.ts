/**
 * @description Mutable traversal state used while translating one accepted SVG path.
 * @remarks Ineligible reflection controls remain own properties containing `undefined`; a reset
 * must not reveal control coordinates inherited from the host's prototype state.
 */
export type TSvgPathNormalisationState = {
  /** @description Current absolute horizontal coordinate. */
  currentX: number;
  /** @description Current absolute vertical coordinate. */
  currentY: number;
  /** @description Current contour starting horizontal coordinate. */
  contourStartX: number;
  /** @description Current contour starting vertical coordinate. */
  contourStartY: number;
  /** @description Previous cubic second-control horizontal coordinate eligible for reflection. */
  cubicControlX: number | undefined;
  /** @description Previous cubic second-control vertical coordinate eligible for reflection. */
  cubicControlY: number | undefined;
  /** @description Previous quadratic control horizontal coordinate eligible for reflection. */
  quadraticControlX: number | undefined;
  /** @description Previous quadratic control vertical coordinate eligible for reflection. */
  quadraticControlY: number | undefined;
};
