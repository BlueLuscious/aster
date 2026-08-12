/**
 * @description Measures deterministic operation scenarios through injected host capabilities.
 */
export class BenchmarkRunner {
  /**
   * @description Host supplying clock, heap, and garbage-collection capabilities.
   */
  #host;

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
   * @param {{ assertAvailable(): void, collectGarbage(): void, now(): bigint, heapUsed(): number }} host - Explicit measurement host.
   * @param {{ warmupOperations?: number, sampleCount?: number }} [options] - Optional stable methodology controls.
   */
  constructor(host, options = {}) {
    this.#host = host;
    this.#warmupOperations = options.warmupOperations ?? 500;
    this.#sampleCount = options.sampleCount ?? 7;

    this.#positiveInteger(this.#warmupOperations, "options.warmupOperations");
    this.#positiveInteger(this.#sampleCount, "options.sampleCount");
  }

  /**
   * @description Measures one deterministic operation scenario after warm-up.
   * @param {{ name: string, operationsPerSample: number, execute(iterations: number): number }} scenario - Scenario definition.
   * @returns {{ name: string, operationsPerSample: number, medianNanosecondsPerOperation: number, minimumNanosecondsPerOperation: number, maximumNanosecondsPerOperation: number, medianHeapGrowthBytesPerOperation: number, checksum: number }} Comparison summary.
   */
  measure(scenario) {
    this.#host.assertAvailable();
    this.#positiveInteger(
      scenario.operationsPerSample,
      "scenario.operationsPerSample",
    );
    scenario.execute(this.#warmupOperations);

    const timings = [];
    const heapGrowth = [];
    let checksum = 0;

    for (let index = 0; index < this.#sampleCount; index += 1) {
      this.#host.collectGarbage();
      const heapBefore = this.#host.heapUsed();
      const startedAt = this.#host.now();
      checksum = scenario.execute(scenario.operationsPerSample);
      const elapsed = this.#host.now() - startedAt;
      const heapAfter = this.#host.heapUsed();

      timings.push(Number(elapsed) / scenario.operationsPerSample);
      heapGrowth.push(
        Math.max(0, heapAfter - heapBefore) / scenario.operationsPerSample,
      );
    }

    return Object.freeze({
      name: scenario.name,
      operationsPerSample: scenario.operationsPerSample,
      medianNanosecondsPerOperation: Math.round(this.#median(timings)),
      minimumNanosecondsPerOperation: Math.round(Math.min(...timings)),
      maximumNanosecondsPerOperation: Math.round(Math.max(...timings)),
      medianHeapGrowthBytesPerOperation: Math.round(this.#median(heapGrowth)),
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
      timing: "median high-resolution elapsed nanoseconds per operation",
      memory:
        "median non-negative heap growth bytes per operation after forced pre-sample collection",
    });
  }

  /**
   * @description Calculates the median of one non-empty numeric sample.
   * @param {readonly number[]} values - Numeric observations to order without mutating the caller.
   * @returns {number} Middle observation or mean of the two middle observations.
   */
  #median(values) {
    const ordered = [...values].sort((left, right) => left - right);
    const middle = Math.floor(ordered.length / 2);

    if (ordered.length % 2 === 1) {
      return ordered[middle];
    }

    return (ordered[middle - 1] + ordered[middle]) / 2;
  }

  /**
   * @description Rejects invalid finite positive integer configuration.
   * @param {number} value - Candidate configuration value.
   * @param {string} path - Logical configuration path.
   * @returns {void} Nothing.
   */
  #positiveInteger(value, path) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError(`${path} must be a positive safe integer.`);
    }
  }
}
