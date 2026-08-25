/**
 * @description Immutable report identity and scenario configuration for the SVG comparison.
 */
export const svgBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 1,
  /** @description Measured public package identity. */
  packageName: "@aster/svg",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/svg",
  /** @description Stable public scenario identities and sample sizes. */
  scenarios: Object.freeze({
    coreRevalidation: Object.freeze({
      name: "svg.reference.core-revalidation",
      operationsPerSample: 2_000,
    }),
    minimal: Object.freeze({
      name: "svg.render.minimal",
      operationsPerSample: 2_000,
    }),
    primitives: Object.freeze({
      name: "svg.render.primitives",
      operationsPerSample: 500,
    }),
    corpus: Object.freeze({
      name: "svg.render.corpus",
      operationsPerSample: 1_000,
    }),
    semantic: Object.freeze({
      name: "svg.render.semantic",
      operationsPerSample: 1_500,
    }),
    overrides: Object.freeze({
      name: "svg.render.overrides",
      operationsPerSample: 1_500,
    }),
    rtlMirror: Object.freeze({
      name: "svg.render.rtl-mirror",
      operationsPerSample: 1_500,
    }),
    escaping: Object.freeze({
      name: "svg.render.escaping",
      operationsPerSample: 1_000,
    }),
    pointSequence: Object.freeze({
      name: "svg.render.point-sequence",
      operationsPerSample: 250,
    }),
  }),
});
