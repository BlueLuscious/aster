/**
 * @description Immutable structural roles assigned to recognised SVG source elements.
 */
export const svgSourceElementRoles = Object.freeze({
  /** @description Canonical structural role for root SVG elements. */
  root: "root",
  /** @description Canonical structural role for structural SVG elements. */
  structural: "structural",
  /** @description Canonical structural role for primitive SVG elements. */
  primitive: "primitive",
} as const);
