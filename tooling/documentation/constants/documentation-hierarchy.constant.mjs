/**
 * @description Immutable canonical documentation roots, files, and required hierarchy entries.
 */
export const documentationHierarchy = Object.freeze({
  root: "docs/en",
  packages: "packages",
  decisions: "decisions",
  index: "index.md",
  template: "template.md",
  markdownExtension: ".md",
  requiredEntries: Object.freeze([
    "index.md",
    "architecture/index.md",
    "collections/index.md",
    "decisions/index.md",
    "governance/index.md",
    "packages/index.md",
    "tooling/index.md",
  ]),
});
