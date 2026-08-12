/**
 * @description Immutable lexical authorities used for static source-module inspection.
 */
export const sourceModule = Object.freeze({
  extensionPattern: /\.[cm]?[jt]sx?$/u,
  hostEcosystemPackagePattern: /(?:^|[/@-])(?:lilium|lotus)(?:$|[/@-])/iu,
  nodeProtocolPrefix: "node:",
  specifierPattern: /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu,
});
