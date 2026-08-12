/**
 * @description Immutable lexical rules for local Markdown link extraction and classification.
 */
export const markdownLinkRules = Object.freeze({
  linkPattern: /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/gu,
  externalSchemePattern: /^[a-z][a-z\d+.-]*:/iu,
  wrapperPattern: /^<|>$/gu,
});
