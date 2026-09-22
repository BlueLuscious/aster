/**
 * @description Immutable private output-host failure discriminators.
 */
export const outputErrorKinds = Object.freeze({
  /** @description Failure caused by an existing or colliding output location. */
  conflict: "conflict",
  /** @description Failure caused by an unavailable output operation. */
  failure: "failure",
} as const);
