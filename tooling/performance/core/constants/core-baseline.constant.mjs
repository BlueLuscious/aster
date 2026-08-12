/**
 * @description Immutable report identity and scenario configuration for the Core comparison.
 */
export const coreBaseline = Object.freeze({
  schemaVersion: 1,
  packageName: "@aster/core",
  packagePath: "packages/core",
  scenarios: Object.freeze({
    iconDefinition: Object.freeze({
      name: "core.icon.define",
      operationsPerSample: 2_000,
    }),
    collectionDefinition: Object.freeze({
      name: "core.collection.define",
      operationsPerSample: 250,
    }),
  }),
});
