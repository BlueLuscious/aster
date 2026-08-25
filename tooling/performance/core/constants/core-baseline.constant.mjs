/**
 * @description Immutable report identity and scenario configuration for the Core comparison.
 */
export const coreBaseline = Object.freeze({
  schemaVersion: 2,
  packageName: "@aster/core",
  packagePath: "packages/core",
  scenarios: Object.freeze({
    iconMutable: Object.freeze({
      name: "core.icon.define.mutable",
      operationsPerSample: 2_000,
    }),
    iconCanonical: Object.freeze({
      name: "core.icon.define.canonical",
      operationsPerSample: 2_000,
    }),
    collectionEmpty: Object.freeze({
      name: "core.collection.define.empty",
      operationsPerSample: 2_000,
    }),
    collectionSingleCanonical: Object.freeze({
      name: "core.collection.define.single-canonical",
      operationsPerSample: 1_000,
    }),
    collectionCompleteMutable: Object.freeze({
      name: "core.collection.define.complete-mutable",
      operationsPerSample: 250,
    }),
    collectionCompleteCanonical: Object.freeze({
      name: "core.collection.define.complete-canonical",
      operationsPerSample: 250,
    }),
  }),
});
