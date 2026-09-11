/**
 * @description Immutable report identity and scenario configuration for the Core comparison.
 */
export const coreBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 3,
  /** @description Measured public package identity. */
  packageName: "@aster/core",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/core",
  /** @description Stable public scenario identities and sample sizes. */
  scenarios: Object.freeze({
    /** @description Mutable icon reconstruction scenario. */
    iconMutable: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.icon.define.mutable",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Canonical icon reconstruction scenario. */
    iconCanonical: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.icon.define.canonical",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Empty collection construction scenario. */
    collectionEmpty: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.empty",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Single canonical member collection scenario. */
    collectionSingleCanonical: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.single-canonical",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
    /** @description Complete mutable collection construction scenario. */
    collectionCompleteMutable: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.complete-mutable",
      /** @description Public operations executed per sample. */
      operationsPerSample: 250,
    }),
    /** @description Complete canonical collection construction scenario. */
    collectionCompleteCanonical: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.complete-canonical",
      /** @description Public operations executed per sample. */
      operationsPerSample: 250,
    }),
  }),
});
