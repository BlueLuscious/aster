/**
 * @description Immutable canonical documentation roots, files, and required hierarchy entries.
 */
export const documentationHierarchy = Object.freeze({
  root: "docs/en",
  packages: "packages",
  index: "index.md",
  markdownExtension: ".md",
  canonicalDirectories: Object.freeze([
    "collections",
    "packages",
    "project",
    "tooling",
  ]),
  canonicalFiles: Object.freeze(["future-capabilities.md", "index.md"]),
  requiredEntries: Object.freeze([
    "index.md",
    "collections/index.md",
    "future-capabilities.md",
    "packages/index.md",
    "project/index.md",
    "tooling/index.md",
  ]),
});
