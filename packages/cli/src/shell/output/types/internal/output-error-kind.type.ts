import type { outputErrorKinds } from "../../constants/output-error-kinds.constant.js";

/**
 * @description Closed private output-host failure family.
 */
export type TOutputErrorKind =
  (typeof outputErrorKinds)[keyof typeof outputErrorKinds];
