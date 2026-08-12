/**
 * @description Deterministic operation scenario accepted by the shared benchmark runner.
 * @typedef {object} IBenchmarkScenario
 * @property {string} name - Stable scenario identity.
 * @property {number} operationsPerSample - Operations executed in each retained sample.
 * @property {(iterations: number) => number} execute - Executes operations and returns a checksum.
 */

export {};
