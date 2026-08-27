import { Buffer } from "node:buffer";

/**
 * @description Measures fresh-process CLI startup without package-manager bootstrap cost.
 */
export class CliColdStartRunner {
  /** @description Fresh Node process capability. */
  #processHost;

  /** @description Numeric sample aggregation authority. */
  #statistics;

  /** @description Number of retained fresh-process samples. */
  #sampleCount;

  /**
   * @description Creates one CLI cold-start runner.
   * @param {import("../contracts/internal/cli-process-host.contract.mjs").ICliProcessHost} processHost - Fresh Node process capability.
   * @param {import("../../shared/runtime/numeric-sample.statistics.mjs").NumericSampleStatistics} statistics - Numeric sample aggregation authority.
   * @param {number} [sampleCount] - Number of retained process samples.
   */
  constructor(processHost, statistics, sampleCount = 7) {
    if (!Number.isSafeInteger(sampleCount) || sampleCount <= 0) {
      throw new TypeError("sampleCount must be a positive safe integer.");
    }

    this.#processHost = processHost;
    this.#statistics = statistics;
    this.#sampleCount = sampleCount;
  }

  /**
   * @description Measures one cold Node scenario and verifies its exact process contract.
   * @param {{ name: string, executablePath?: string, arguments: readonly string[], stdout: string }} scenario - Complete cold scenario.
   * @returns {{ name: string, samples: number, medianNanoseconds: number, minimumNanoseconds: number, maximumNanoseconds: number, stdoutBytes: number }} Cold-start evidence.
   */
  measure(scenario) {
    const timings = [];

    for (let index = 0; index < this.#sampleCount; index += 1) {
      const result = this.#processHost.execute(scenario);

      if (result.status !== 0 || result.stdout !== scenario.stdout || result.stderr !== "") {
        throw new Error(`Cold scenario ${scenario.name} changed its process contract.`);
      }

      timings.push(result.elapsedNanoseconds);
    }

    const timing = this.#statistics.summarise(timings);

    return Object.freeze({
      name: scenario.name,
      samples: this.#sampleCount,
      medianNanoseconds: Math.round(timing.median),
      minimumNanoseconds: Math.round(timing.minimum),
      maximumNanoseconds: Math.round(timing.maximum),
      stdoutBytes: Buffer.byteLength(scenario.stdout),
    });
  }
}
