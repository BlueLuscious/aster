import type { iconRtlPolicies } from "../constants/icon-rtl-policies.constant.js";

/**
 * @description Target-independent policy for right-to-left geometry handling.
 */
export type IconRtlPolicyType = (typeof iconRtlPolicies)[number];
