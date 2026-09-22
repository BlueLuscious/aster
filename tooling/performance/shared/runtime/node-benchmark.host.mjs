/**
 * @description Node host capabilities required by development-only performance comparisons.
 */
export class NodeBenchmarkHost {
  /**
   * @description Ensures explicit garbage collection is available before measurement begins.
   * @returns {void} Nothing.
   */
  assertAvailable() {
    if (typeof globalThis.gc !== "function") {
      throw new Error("Performance comparisons require Node --expose-gc.");
    }
  }

  /**
   * @description Requests garbage collection before one independent measurement sample.
   * @returns {void} Nothing.
   */
  collectGarbage() {
    globalThis.gc?.();
  }

  /**
   * @description Reads the current monotonic high-resolution clock.
   * @returns {bigint} Current monotonic time in nanoseconds.
   */
  now() {
    return process.hrtime.bigint();
  }

  /**
   * @description Reads the current JavaScript heap usage reported by Node.
   * @returns {number} Current used heap bytes.
   */
  heapUsed() {
    return process.memoryUsage().heapUsed;
  }

  /**
   * @description Describes the runtime environment that owns one comparison report.
   * @returns {{ node: string, platform: string, architecture: string }} Runtime identity.
   */
  environment() {
    return Object.freeze({
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
    });
  }
}
