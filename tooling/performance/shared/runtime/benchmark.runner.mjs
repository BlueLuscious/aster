import { benchmarkMethodology } from "../constants/benchmark-methodology.constant.mjs";
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
    this.#configuration.positiveInteger(this.#sampleCount, "options.sampleCount");
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
   * @description Determines whether one scenario result requires asynchronous settlement.
   * @param {number | PromiseLike<number>} value - Direct or deferred scenario checksum.
   * @returns {boolean} Whether the value exposes a callable promise-like continuation.
   */
  #isPromiseLike(value) {
    return (
      value !== null
      && (typeof value === "object" || typeof value === "function")
      && typeof value.then === "function"
    );
  }

}
