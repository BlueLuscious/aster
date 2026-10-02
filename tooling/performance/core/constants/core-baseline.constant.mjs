/**
 * @description Immutable report identity and scenario configuration for the Core comparison.
 */
export const coreBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 5,
  /** @description Measured public package identity. */
  packageName: "@luscious-garden/aster-core",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/core",
  /** @description Fixed collection sizes independent of product artwork growth. */
  collectionSizes: Object.freeze({
    /** @description Current representative general-purpose collection cardinality. */
    representative: 26,
    /** @description Large synthetic dictionary cardinality for scaling evidence. */
    large: 256,
  }),
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
    /** @description Straight structured path construction scenario. */
    pathStraight: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.icon.define.path-straight",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Curved structured path construction scenario. */
    pathCurved: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.icon.define.path-curved",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Compound structured path construction scenario. */
    pathCompound: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.icon.define.path-compound",
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
    /** @description Authored representative dictionary containing mutable icon values. */
    collectionRepresentativeMutable: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.representative-mutable",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Authored representative dictionary containing canonical icons. */
    collectionRepresentativeCanonical: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.representative-canonical",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Large authored dictionary containing canonical icons. */
    collectionLargeCanonical: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "core.collection.define.large-canonical",
      /** @description Public operations executed per sample. */
      operationsPerSample: 25,
    }),
  }),
});
