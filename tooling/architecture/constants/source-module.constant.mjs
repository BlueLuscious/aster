/**
 * @description Immutable lexical authorities used for static source-module inspection.
 */
export const sourceModule = Object.freeze({
  /** @description Accepted JavaScript and TypeScript source filename pattern. */
  extensionPattern: /\.[cm]?[jt]sx?$/u,
  /** @description Prefix identifying Node-owned module specifiers. */
  nodeProtocolPrefix: "node:",
  /** @description Static import and export specifier extraction pattern. */
  specifierPattern: /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu,
});
