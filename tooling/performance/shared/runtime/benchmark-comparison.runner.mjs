import { benchmarkComparison } from "../constants/benchmark-comparison.constant.mjs";
import { NumericSampleStatistics } from "./numeric-sample.statistics.mjs";

/** @description Runs finite matched orders and retains partial evidence instead of retrying failures. */
export class BenchmarkComparisonRunner {
  /** @description Shared exact median/minimum/maximum authority used to validate raw reports. */
  #statistics = new NumericSampleStatistics();
  /**
   * @description Executes three matched rounds with invariant workload, output and sampling controls.
   * @param {Readonly<Record<string, () => Promise<import("../contracts/internal/benchmark-comparison-entry.contract.mjs").IBenchmarkComparisonEntry>>>} variants - Explicit baseline, byte-identical control and candidate capabilities.
   * @returns {Promise<{ schemaVersion: number, complete: boolean, runs: readonly Readonly<{ round: number, variant: string, entry: import("../contracts/internal/benchmark-comparison-entry.contract.mjs").IBenchmarkComparisonEntry }>[], failure: Readonly<{ round: number, variant: string, message: string, partialEvidence: unknown }> | null }>} Complete or interrupted evidence, without timing-based pass thresholds.
   */
  async run(variants) {
    const runs = [];
    let failure = null;
    for (const [round, order] of benchmarkComparison.orders.entries()) {
      for (const variant of order) {
        try {
          if (
            !Object.hasOwn(variants, variant) ||
            typeof variants[variant] !== "function"
          ) {
            throw new TypeError(`Missing benchmark variant: ${variant}.`);
          }
          const entry = await variants[variant]();
          runs.push(Object.freeze({ round, variant, entry }));
          this.#validate(runs);
        } catch (error) {
          failure = Object.freeze({
            round,
            variant,
            message: error instanceof Error ? error.message : String(error),
            partialEvidence:
              error instanceof Error && "samples" in error
                ? error.samples
                : error instanceof Error && "trials" in error
                  ? error.trials
                  : null,
          });
          break;
        }
      }
      if (failure !== null) {
        break;
      }
    }
    return Object.freeze({
      schemaVersion: benchmarkComparison.schemaVersion,
      complete: failure === null,
      runs: Object.freeze(runs),
      failure,
    });
  }

  /**
   * @description Confirms equal required work and raw sample integrity before interpreting timing.
   * @param {readonly { variant: string, entry: import("../contracts/internal/benchmark-comparison-entry.contract.mjs").IBenchmarkComparisonEntry }[]} runs - Retained observations including the latest result.
   * @returns {void} Nothing when identities and observations agree.
   */
  #validate(runs) {
    const reference = runs[0]?.entry;
    if (reference === undefined) {
      throw new Error("Comparison requires an observation.");
    }
    for (const { entry, variant } of runs) {
      const observation = entry.observation;
      if (
        ![
          entry.sourceSignature,
          entry.workloadSignature,
          entry.outputSignature,
        ].every((value) => typeof value === "string" && value.length > 0) ||
        entry.workloadSignature !== reference.workloadSignature ||
        entry.outputSignature !== reference.outputSignature ||
        observation.schemaVersion !== benchmarkComparison.schemaVersion ||
        !Number.isSafeInteger(observation.operationsPerSample) ||
        observation.operationsPerSample <= 0 ||
        !Number.isSafeInteger(observation.methodology.sampleCount) ||
        observation.methodology.sampleCount <= 0 ||
        !Number.isSafeInteger(observation.methodology.warmupOperations) ||
        observation.methodology.warmupOperations <= 0 ||
        typeof observation.methodology.timing !== "string" ||
        observation.methodology.timing.length === 0 ||
        typeof observation.methodology.memory !== "string" ||
        observation.methodology.memory.length === 0 ||
        observation.name !== reference.observation.name ||
        observation.operationsPerSample !==
          reference.observation.operationsPerSample ||
        JSON.stringify(observation.methodology) !==
          JSON.stringify(reference.observation.methodology) ||
        observation.samples.length !== observation.methodology.sampleCount ||
        observation.samples.some(
          (sample) =>
            !Number.isFinite(sample.checksum) ||
            sample.checksum !== reference.observation.samples[0]?.checksum ||
            !Number.isSafeInteger(sample.elapsedNanoseconds) ||
            sample.elapsedNanoseconds < 0 ||
            sample.nanosecondsPerOperation !==
              sample.elapsedNanoseconds / observation.operationsPerSample ||
            !Number.isFinite(sample.heapGrowthBytes) ||
            sample.heapGrowthBytes < 0,
        )
      ) {
        throw new Error(
          "Benchmark comparison changed workload, output or sample contract.",
        );
      }
      const baseline = runs.find((run) => run.variant === "baseline")?.entry;
      const prior = runs.find((run) => run.variant === variant)?.entry;
      const timing = this.#statistics.summarise(
        observation.samples.map((sample) => sample.nanosecondsPerOperation),
      );
      if (
        prior?.sourceSignature !== entry.sourceSignature ||
        JSON.stringify(timing) !== JSON.stringify(observation.timing)
      ) {
        throw new Error(
          "Benchmark source or timing summary changed within a variant.",
        );
      }
      if (
        variant === "control" &&
        baseline !== undefined &&
        entry.sourceSignature !== baseline.sourceSignature
      ) {
        throw new Error("Benchmark control is not byte-identical to baseline.");
      }
    }
  }
}
