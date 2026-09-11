/**
 * @description Immutable report identity and scenario configuration for the Import comparison.
 */
export const importBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 2,
  /** @description Measured private package identity. */
  packageName: "@aster/import",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/import",
  /** @description Stable request count represented by the ordinary batch scenario. */
  batchSize: 8,
  /** @description Stable source and batch scales used by explicit pressure scenarios. */
  scales: Object.freeze({
    /** @description Element count represented by the medium source fixture. */
    mediumSourceElements: 16,
    /** @description Element count represented by the large source fixture. */
    largeSourceElements: 64,
    /** @description Request count represented by the large batch fixture. */
    largeBatchSize: 32,
  }),
  /** @description Stable public scenario identities and sample sizes. */
  scenarios: Object.freeze({
    /** @description Minimal accepted SVG inspection scenario. */
    inspectMinimal: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.inspect.minimal-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 250,
    }),
    /** @description Representative editor SVG inspection scenario. */
    inspectEditor: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.inspect.editor-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Rejected SVG inspection scenario. */
    inspectRejected: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.inspect.rejected-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 250,
    }),
    /** @description Medium-scale SVG inspection scenario. */
    inspectMedium: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.inspect.medium-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 50,
    }),
    /** @description Large-scale SVG inspection scenario. */
    inspectLarge: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.inspect.large-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 10,
    }),
    /** @description Reviewed draft definition scenario. */
    define: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.define.reviewed-draft",
      /** @description Public operations executed per sample. */
      operationsPerSample: 500,
    }),
    /** @description Editable TypeScript emission scenario. */
    emit: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.emit.editable-module",
      /** @description Public operations executed per sample. */
      operationsPerSample: 500,
    }),
    /** @description Single SVG adoption scenario. */
    adopt: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.adopt.single-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Ordinary SVG batch adoption scenario. */
    adoptBatch: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.adopt.batch-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 10,
    }),
    /** @description Large SVG batch adoption scenario. */
    adoptLargeBatch: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "import.adopt.large-batch-svg",
      /** @description Public operations executed per sample. */
      operationsPerSample: 3,
    }),
  }),
});
