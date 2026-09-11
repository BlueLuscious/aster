/**
 * @description Immutable defaults and descriptions defining the shared comparison methodology.
 */
export const benchmarkMethodology = Object.freeze({
  /** @description Number of independent samples retained for each scenario. */
  sampleCount: 7,
  /** @description Number of untimed operations executed before sampling. */
  warmupOperations: 500,
  /** @description Stable interpretation of elapsed-time report fields. */
  timing: "median high-resolution elapsed nanoseconds per operation",
  /** @description Stable interpretation of heap-pressure report fields. */
  memory:
    "median non-negative heap growth bytes per operation after forced pre-sample collection",
});
