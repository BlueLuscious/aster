/** @description Bounded controls for supplemental measurements, separate from fixed package baselines. */
export const benchmarkComparison = Object.freeze({
  /** @description Supplemental observation and comparison envelope revision. */
  schemaVersion: 1,
  /** @description Increasing baseline-only calibration operation counts. */
  calibrationCounts: Object.freeze([1, 10, 100, 1_000, 10_000]),
  /** @description Minimum desired duration of a calibrated sample. */
  targetNanoseconds: 25_000_000,
  /** @description Maximum accepted elapsed duration of a calibration trial. */
  maximumTrialNanoseconds: 5_000_000_000,
  /** @description Maximum complete operations used for supplemental warm-up. */
  maximumWarmupOperations: 20,
  /** @description Matched baseline, identical-control and candidate orders. */
  orders: Object.freeze([
    Object.freeze(["baseline", "control", "candidate"]),
    Object.freeze(["candidate", "baseline", "control"]),
    Object.freeze(["control", "candidate", "baseline"]),
  ]),
  /** @description Default process deadline, including startup. */
  timeoutMilliseconds: 120_000,
  /** @description V8 old-space ceiling for supplemental processes, in MiB. */
  heapMebibytes: 2_048,
  /** @description Maximum retained combined standard-stream bytes per process. */
  maximumOutputBytes: 8_388_608,
  /** @description Maximum bytes acquired from one native-import JSON request file. */
  maximumRequestBytes: 8_388_608,
  /** @description Maximum observed process RSS before termination. */
  maximumRssBytes: 2_147_483_648,
  /** @description Maximum files owned by a synthetic workspace. */
  maximumFiles: 100_000,
  /** @description Maximum bytes written through a synthetic workspace. */
  maximumWorkspaceBytes: 1_073_741_824,
});
