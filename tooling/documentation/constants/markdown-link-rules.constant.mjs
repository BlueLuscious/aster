/**
 * @description Immutable lexical rules for local Markdown link extraction and classification.
 */
export const markdownLinkRules = Object.freeze({
  /** @description Markdown target extraction pattern. */
  linkPattern: /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/gu,
  /** @description URI scheme pattern identifying external targets. */
  externalSchemePattern: /^[a-z][a-z\d+.-]*:/iu,
  /** @description Optional angle-bracket wrapper removal pattern. */
  wrapperPattern: /^<|>$/gu,
});
