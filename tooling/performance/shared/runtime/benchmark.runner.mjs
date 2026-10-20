import { benchmarkMethodology } from "../constants/benchmark-methodology.constant.mjs";
import { benchmarkComparison } from "../constants/benchmark-comparison.constant.mjs";
import { BenchmarkConfigurationValidator } from "./benchmark-configuration.validator.mjs";

/**
 * @description Measures deterministic synchronous or asynchronous operation scenarios through injected host capabilities.
 */
export class BenchmarkRunner {
  /** @description Shared closed benchmark configuration validator. */
  #configuration = new BenchmarkConfigurationValidator();

  /**
   * @description Host supplying clock, heap, and garbage-collection capabilities.
   * @type {import("../contracts/internal/benchmark-host.contract.mjs").IBenchmarkHost}
   */
  #host;

  /**
   * @description Numeric sample aggregation authority.
   * @type {import("./numeric-sample.statistics.mjs").NumericSampleStatistics}
   */
  #statistics;

  /**
   * @description Number of untimed operations used to stabilise each scenario.
   */
  #warmupOperations;

  /**
   * @description Number of independently measured samples retained for each scenario.
   */
  #sampleCount;

  /**
   * @description Creates one reusable benchmark runner.
   * @param {import("../contracts/internal/benchmark-host.contract.mjs").IBenchmarkHost} host - Explicit measurement host.
   * @param {import("./numeric-sample.statistics.mjs").NumericSampleStatistics} statistics - Numeric sample aggregation authority.
   * @param {{ warmupOperations?: number, sampleCount?: number }} [options] - Optional stable methodology controls.
   */
  constructor(host, statistics, options = {}) {
    this.#host = host;
    this.#statistics = statistics;
    this.#warmupOperations =
      options.warmupOperations ?? benchmarkMethodology.warmupOperations;
    this.#sampleCount = options.sampleCount ?? benchmarkMethodology.sampleCount;

    this.#configuration.positiveInteger(
      this.#warmupOperations,
      "options.warmupOperations",
    );
    this.#configuration.positiveInteger(
      this.#sampleCount,
      "options.sampleCount",
    );
  }

  /**
   * @description Measures one deterministic operation scenario after warm-up without suspending synchronous timing paths.
   * @param {import("../contracts/internal/benchmark-scenario.contract.mjs").IBenchmarkScenario} scenario - Scenario definition.
   * @returns {Promise<{ name: string, operationsPerSample: number, medianNanosecondsPerOperation: number, minimumNanosecondsPerOperation: number, maximumNanosecondsPerOperation: number, medianHeapGrowthBytesPerOperation: number, checksum: number }>} Comparison summary.
   */
  async measure(scenario) {
    this.#host.assertAvailable();
    this.#configuration.positiveInteger(
      scenario.operationsPerSample,
      "scenario.operationsPerSample",
    );
    const warmupResult = scenario.execute(this.#warmupOperations);

    if (this.#isPromiseLike(warmupResult)) {
      await warmupResult;
    }

    const timings = [];
    const heapGrowth = [];
    let checksum = 0;

    for (let index = 0; index < this.#sampleCount; index += 1) {
      this.#host.collectGarbage();
      const heapBefore = this.#host.heapUsed();
      const startedAt = this.#host.now();
      const executionResult = scenario.execute(scenario.operationsPerSample);

      checksum = this.#isPromiseLike(executionResult)
        ? await executionResult
        : executionResult;
      const elapsed = this.#host.now() - startedAt;
      const heapAfter = this.#host.heapUsed();

      timings.push(Number(elapsed) / scenario.operationsPerSample);
      heapGrowth.push(
        Math.max(0, heapAfter - heapBefore) / scenario.operationsPerSample,
      );
    }

    const timing = this.#statistics.summarise(timings);
    const memory = this.#statistics.summarise(heapGrowth);

    return Object.freeze({
      name: scenario.name,
      operationsPerSample: scenario.operationsPerSample,
      medianNanosecondsPerOperation: Math.round(timing.median),
      minimumNanosecondsPerOperation: Math.round(timing.minimum),
      maximumNanosecondsPerOperation: Math.round(timing.maximum),
      medianHeapGrowthBytesPerOperation: Math.round(memory.median),
      checksum,
    });
  }

  /**
   * @description Describes the stable methodology owned by this runner.
   * @returns {{ sampleCount: number, warmupOperations: number, timing: string, memory: string }} Immutable methodology summary.
   */
  methodology() {
    return Object.freeze({
      sampleCount: this.#sampleCount,
      warmupOperations: this.#warmupOperations,
      timing: benchmarkMethodology.timing,
      memory: benchmarkMethodology.memory,
    });
  }

  /**
   * @description Calibrates an untouched baseline before freezing a supplemental comparison's count.
   * @remarks Run the pilot in a bounded process. An elapsed check cannot interrupt synchronous JavaScript.
   * @param {Pick<import("../contracts/internal/benchmark-scenario.contract.mjs").IBenchmarkScenario, "name" | "execute">} scenario - Prepared complete operation.
   * @returns {Promise<{ operationsPerSample: number, warmupOperations: number, reachedTarget: boolean, trials: readonly Readonly<{ operations: number, elapsedNanoseconds: number, checksum: number }>[] }>} Retained calibration, including capped trials.
   */
  async calibrate(scenario) {
    this.#host.assertAvailable();
    const trials = [];
    try {
      for (const operations of benchmarkComparison.calibrationCounts) {
        this.#host.collectGarbage();
        const startedAt = this.#host.now();
        const result = scenario.execute(operations);
        const checksum = this.#isPromiseLike(result) ? await result : result;
        const elapsedNanoseconds = Number(this.#host.now() - startedAt);
        this.#validateObservation(elapsedNanoseconds, checksum);
        trials.push(
          Object.freeze({ operations, elapsedNanoseconds, checksum }),
        );
        if (elapsedNanoseconds > benchmarkComparison.maximumTrialNanoseconds) {
          throw Object.assign(
            new Error("Calibration exceeded its trial budget."),
            {
              trials: Object.freeze(trials),
            },
          );
        }
        if (
          elapsedNanoseconds >= benchmarkComparison.targetNanoseconds ||
          operations === benchmarkComparison.calibrationCounts.at(-1)
        ) {
          return Object.freeze({
            operationsPerSample: operations,
            warmupOperations: Math.min(
              operations,
              benchmarkComparison.maximumWarmupOperations,
            ),
            reachedTarget:
              elapsedNanoseconds >= benchmarkComparison.targetNanoseconds,
            trials: Object.freeze(trials),
          });
        }
      }
      throw new Error("Calibration has no configured operation counts.");
    } catch (error) {
      throw this.#retainFailure(error, "trials", trials);
    }
  }

  /**
   * @description Retains every supplemental observation without changing historical measure results.
   * @param {import("../contracts/internal/benchmark-scenario.contract.mjs").IBenchmarkScenario} scenario - Prepared operation with a previously frozen count.
   * @returns {Promise<import("../contracts/internal/benchmark-observation.contract.mjs").IBenchmarkObservation>} Raw samples and their explicit methodology.
   */
  async observe(scenario) {
    this.#host.assertAvailable();
    this.#configuration.positiveInteger(
      scenario.operationsPerSample,
      "scenario.operationsPerSample",
    );
    const samples = [];
    try {
      const warmup = scenario.execute(this.#warmupOperations);
      if (this.#isPromiseLike(warmup)) {
        await warmup;
      }
      for (let index = 0; index < this.#sampleCount; index += 1) {
        this.#host.collectGarbage();
        const heapBefore = this.#host.heapUsed();
        const startedAt = this.#host.now();
        const result = scenario.execute(scenario.operationsPerSample);
        const checksum = this.#isPromiseLike(result) ? await result : result;
        const elapsedNanoseconds = Number(this.#host.now() - startedAt);
        const heapAfter = this.#host.heapUsed();
        this.#validateObservation(elapsedNanoseconds, checksum);
        if (
          ![heapBefore, heapAfter].every(
            (value) => Number.isFinite(value) && value >= 0,
          )
        ) {
          throw new TypeError("Invalid benchmark heap observation.");
        }
        samples.push(
          Object.freeze({
            elapsedNanoseconds,
            nanosecondsPerOperation:
              elapsedNanoseconds / scenario.operationsPerSample,
            heapGrowthBytes: Math.max(0, heapAfter - heapBefore),
            checksum,
          }),
        );
        if (checksum !== samples[0]?.checksum) {
          throw Object.assign(
            new Error("Supplemental checksums changed between samples."),
            {
              samples: Object.freeze(samples),
            },
          );
        }
      }
      return Object.freeze({
        schemaVersion: benchmarkComparison.schemaVersion,
        name: scenario.name,
        operationsPerSample: scenario.operationsPerSample,
        methodology: this.methodology(),
        timing: this.#statistics.summarise(
          samples.map((sample) => sample.nanosecondsPerOperation),
        ),
        samples: Object.freeze(samples),
      });
    } catch (error) {
      throw this.#retainFailure(error, "samples", samples);
    }
  }

  /**
   * @description Retains completed raw observations when execution or validation fails.
   * @param {unknown} error - Original reason, preserved as the cause.
   * @param {string} key - Observation family attached to the diagnostic.
   * @param {readonly unknown[]} evidence - Completed observations before the failure.
   * @returns {Error} Diagnostic retaining its original reason and partial evidence.
   */
  #retainFailure(error, key, evidence) {
    return Object.assign(
      new Error(error instanceof Error ? error.message : String(error), {
        cause: error,
      }),
      {
        [key]: Object.freeze([...evidence]),
      },
    );
  }

  /**
   * @description Rejects invalid supplemental clock or checksum values instead of summarising them.
   * @param {number} elapsed - Measured non-negative duration.
   * @param {number} checksum - Finite operation checksum.
   * @returns {void} Nothing.
   */
  #validateObservation(elapsed, checksum) {
    if (
      !Number.isSafeInteger(elapsed) ||
      elapsed < 0 ||
      !Number.isFinite(checksum)
    ) {
      throw new TypeError("Invalid benchmark time or checksum observation.");
    }
  }

  /**
   * @description Determines whether one scenario result requires asynchronous settlement.
   * @param {number | PromiseLike<number>} value - Direct or deferred scenario checksum.
   * @returns {value is PromiseLike<number>} Whether the value exposes a callable promise-like continuation.
   */
  #isPromiseLike(value) {
    return (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      typeof value.then === "function"
    );
  }
}
