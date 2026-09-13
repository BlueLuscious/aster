/**
 * @description Immutable report identity and public import scenarios for the Icons distribution
 * baseline.
 */
export const iconsBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 1,
  /** @description Measured public package identity. */
  packageName: "@aster/icons",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/icons",
  /** @description Workspace-relative disposable module probe path. */
  probePath: "tooling/performance/shared/module-import-probe.mjs",
  /** @description Number of independent processes retained for each import scenario. */
  sampleCount: 7,
  /** @description Stable public import scenarios measured before distribution changes. */
  scenarios: Object.freeze({
    /** @description Current package-wide icon root import. */
    root: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "icons.import.root",
      /** @description Public package specifier under measurement. */
      specifier: "@aster/icons",
    }),
    /** @description Representative isolated icon import. */
    isolatedIcon: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "icons.import.isolated-icon",
      /** @description Public package specifier under measurement. */
      specifier: "@aster/icons/camera",
    }),
    /** @description Representative isolated collection import. */
    isolatedCollection: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "icons.import.isolated-collection",
      /** @description Public package specifier under measurement. */
      specifier: "@aster/icons/collections/amellus",
    }),
  }),
});
