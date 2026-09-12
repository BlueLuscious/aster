/**
 * @description Immutable report identity and scenario configuration for the SVG comparison.
 */
export const svgBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 2,
  /** @description Measured public package identity. */
  packageName: "@aster/svg",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/svg",
  /** @description Stable public scenario identities and sample sizes. */
  scenarios: Object.freeze({
    /** @description Core reconstruction attribution scenario. */
    coreRevalidation: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.reference.core-revalidation",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Minimal single-node rendering scenario. */
    minimal: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.minimal",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Complete primitive-family rendering scenario. */
    primitives: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.primitives",
      /** @description Public operations executed per sample. */
      operationsPerSample: 500,
    }),
    /** @description Fixed synthetic corpus rendering scenario. */
    corpus: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.corpus",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
    /** @description Semantic accessibility rendering scenario. */
    semantic: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.semantic",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_500,
    }),
    /** @description Authorised presentation override rendering scenario. */
    overrides: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.overrides",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_500,
    }),
    /** @description Right-to-left mirroring scenario. */
    rtlMirror: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.rtl-mirror",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_500,
    }),
    /** @description Replacement-heavy XML escaping scenario. */
    escaping: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.escaping",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
    /** @description Dense point-sequence rendering scenario. */
    pointSequence: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "svg.render.point-sequence",
      /** @description Public operations executed per sample. */
      operationsPerSample: 250,
    }),
  }),
});
