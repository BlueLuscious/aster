import type { IconRtlPolicyType } from "../types/index.js";

/**
 * @description Immutable accepted right-to-left policies in canonical semantic order.
 */
export const iconRtlPolicies = Object.freeze([
  "mirror",
  "preserve",
  "manual",
] as const satisfies readonly IconRtlPolicyType[]);
