/**
 * @description Documents the asynchronous operation shape consumed by shared performance tooling.
 */
export class IAsyncBenchmarkScenario {
  /** @description Stable scenario identity. */
  name;

  /** @description Number of operations represented by each retained sample. */
  operationsPerSample;

  /**
   * @description Executes and consumes the requested number of asynchronous operations.
   * @param {number} _iterations - Number of operations to execute.
   * @returns {Promise<number>} Deterministic checksum over complete results.
   */
  async execute(_iterations) {
    throw new Error("IAsyncBenchmarkScenario.execute must be implemented.");
  }
}
