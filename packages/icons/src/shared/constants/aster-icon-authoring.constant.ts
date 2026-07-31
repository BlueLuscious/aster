import type {
  IconPresentationPolicy,
  IconViewBox,
} from "@aster/core";

/**
 * @description Immutable authoring defaults shared by canonical Aster icon definitions.
 */
export const asterIconAuthoring = Object.freeze({
  namespace: "aster",
  licence: "ISC",
  attribution: "BlueLuscious",
  viewBox: Object.freeze({
    minX: 0,
    minY: 0,
    width: 24,
    height: 24,
  }) satisfies IconViewBox,
  presentation: Object.freeze({
    defaults: Object.freeze({
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    }),
    overrides: Object.freeze([]),
    defaultSize: 24,
    minimumSize: 16,
  }) satisfies IconPresentationPolicy,
});
