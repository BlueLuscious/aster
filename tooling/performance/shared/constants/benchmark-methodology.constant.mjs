/**
 * @description Immutable defaults and descriptions defining the shared comparison methodology.
 */
export const benchmarkMethodology = Object.freeze({
  sampleCount: 7,
  warmupOperations: 500,
  timing: "median high-resolution elapsed nanoseconds per operation",
  memory:
    "median non-negative heap growth bytes per operation after forced pre-sample collection",
});
