/**
 * @description Host capabilities required to measure and identify one comparison environment.
 * @typedef {object} IBenchmarkHost
 * @property {() => void} assertAvailable - Verifies that required host capabilities are available.
 * @property {() => void} collectGarbage - Requests collection before an independent sample.
 * @property {() => bigint} now - Reads a monotonic nanosecond clock.
 * @property {() => number} heapUsed - Reads current used heap bytes.
 * @property {() => Readonly<Record<string, string>>} environment - Describes the comparison host.
 */

export {};
