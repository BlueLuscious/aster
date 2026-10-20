/**
 * @description Supplemental raw operation evidence, distinct from historical package reports.
 * @typedef {object} IBenchmarkObservation
 * @property {number} schemaVersion - Supplemental envelope revision.
 * @property {string} name - Complete workload identity.
 * @property {number} operationsPerSample - Frozen operations executed in every sample.
 * @property {{ sampleCount: number, warmupOperations: number, timing: string, memory: string }} methodology - Explicit measurement controls and units.
 * @property {{ median: number, minimum: number, maximum: number }} timing - Nanoseconds-per-operation summary.
 * @property {readonly Readonly<{ elapsedNanoseconds: number, nanosecondsPerOperation: number, heapGrowthBytes: number, checksum: number }>[]} samples - Every observation in execution order; heap growth is not allocation or retained memory.
 */

export {};
