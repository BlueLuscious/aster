import type {
  IconFillRuleType,
  IconStrokeLineCapType,
  IconStrokeLineJoinType,
} from "../types/index.js";

/**
 * @description Immutable accepted values for every enumerated portable presentation field.
 */
export const iconPresentationEnumerations = Object.freeze({
  fillRule: Object.freeze([
    "nonzero",
    "evenodd",
  ] as const satisfies readonly IconFillRuleType[]),
  strokeLineCap: Object.freeze([
    "butt",
    "round",
    "square",
  ] as const satisfies readonly IconStrokeLineCapType[]),
  strokeLineJoin: Object.freeze([
    "miter",
    "round",
    "bevel",
  ] as const satisfies readonly IconStrokeLineJoinType[]),
});
