/**
 * @description Immutable package output and manifest authorities accepted by guarded cleanup.
 */
export const packageOutputCleanup = Object.freeze({
  /** @description Manifest required to identify a package root. */
  manifest: "package.json",
  /** @description Sole direct output directory accepted for cleanup. */
  outputDirectory: "dist",
});
