/**
 * @description Supplemental raw operation evidence, distinct from fixed package reports.
 * @typedef {object} IBenchmarkObservation
 * @property {number} schemaVersion - Supplemental envelope revision.
 * @property {string} name - Complete workload identity.
 * @property {number} operationsPerSample - Frozen operations executed in every sample.
 * @property {{ sampleCount: number, warmupOperations: number, timing: string, memory: string }} methodology - Controls with the canonical `BenchmarkRunner.methodology()` field semantics: sample/warm-up counts and explicit timing/memory qualifications.
 * @property {{ median: number, minimum: number, maximum: number }} timing - Nanoseconds-per-operation `median`, `minimum` and `maximum`, as defined by `NumericSampleStatistics.summarise()`.
 * @property {readonly Readonly<{ elapsedNanoseconds: number, nanosecondsPerOperation: number, heapGrowthBytes: number, checksum: number }>[]} samples - Every observation in execution order: complete `elapsedNanoseconds`, normalised `nanosecondsPerOperation`, non-negative `heapGrowthBytes` and the consumed output `checksum`. Heap growth is not allocation or retained memory.
 */

export {};
