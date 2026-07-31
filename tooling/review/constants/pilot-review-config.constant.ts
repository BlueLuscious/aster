/**
 * @description Immutable configuration for reproducible Aster pilot review evidence.
 */
export const pilotReviewConfig = Object.freeze({
  generatedBy: "pnpm review:pilot",
  source: "@aster/icons/collections/aster",
  outputDirectory: "dist/review/aster",
  gridStep: 0.5,
  safeInset: 2,
  contract: Object.freeze({
    viewBox: Object.freeze({
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
    }),
    strokeWidth: 1.5,
    maximumPrimitives: 16,
    maximumPathCommands: 64,
  }),
  sizes: Object.freeze({
    minimum: 16,
    default: 24,
    silhouette: 40,
  }),
  themes: Object.freeze({
    light: Object.freeze({
      background: "#f6f2e8",
      foreground: "#171713",
    }),
    dark: Object.freeze({
      background: "#171713",
      foreground: "#f6f2e8",
    }),
  }),
  comparisons: Object.freeze({
    circular: Object.freeze(["search", "settings", "camera"]),
    square: Object.freeze(["lock", "home", "folder"]),
    diagonal: Object.freeze(["arrow-left", "check", "close", "star"]),
    asymmetric: Object.freeze([
      "arrow-left",
      "camera",
      "folder",
      "cloud",
      "leaf",
    ]),
    organic: Object.freeze(["heart", "cloud", "leaf"]),
    detailed: Object.freeze(["settings", "camera", "star"]),
  }),
});
