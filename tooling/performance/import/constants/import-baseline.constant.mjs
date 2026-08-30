/**
 * @description Immutable report identity and scenario configuration for the Import comparison.
 */
export const importBaseline = Object.freeze({
  schemaVersion: 2,
  packageName: "@aster/import",
  packagePath: "packages/import",
  batchSize: 8,
  scales: Object.freeze({
    mediumSourceElements: 16,
    largeSourceElements: 64,
    largeBatchSize: 32,
  }),
  scenarios: Object.freeze({
    inspectMinimal: Object.freeze({
      name: "import.inspect.minimal-svg",
      operationsPerSample: 250,
    }),
    inspectEditor: Object.freeze({
      name: "import.inspect.editor-svg",
      operationsPerSample: 100,
    }),
    inspectRejected: Object.freeze({
      name: "import.inspect.rejected-svg",
      operationsPerSample: 250,
    }),
    inspectMedium: Object.freeze({
      name: "import.inspect.medium-svg",
      operationsPerSample: 50,
    }),
    inspectLarge: Object.freeze({
      name: "import.inspect.large-svg",
      operationsPerSample: 10,
    }),
    define: Object.freeze({
      name: "import.define.reviewed-draft",
      operationsPerSample: 500,
    }),
    emit: Object.freeze({
      name: "import.emit.editable-module",
      operationsPerSample: 500,
    }),
    adopt: Object.freeze({
      name: "import.adopt.single-svg",
      operationsPerSample: 100,
    }),
    adoptBatch: Object.freeze({
      name: "import.adopt.batch-svg",
      operationsPerSample: 10,
    }),
    adoptLargeBatch: Object.freeze({
      name: "import.adopt.large-batch-svg",
      operationsPerSample: 3,
    }),
  }),
});
