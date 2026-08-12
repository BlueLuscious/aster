import { markdownLinkRules } from "../constants/markdown-link-rules.constant.mjs";

/**
 * @description Extracts repository-local link targets from Markdown source.
 */
export class MarkdownLinkTargetExtractor {
  /**
   * @description Extracts targets requiring repository path resolution.
   * @param {string} content - Markdown source containing zero or more links.
   * @returns {readonly string[]} Local link targets in source order.
   */
  extract(content) {
    const targets = [];

    for (const match of content.matchAll(markdownLinkRules.linkPattern)) {
      const target = match[1].replace(markdownLinkRules.wrapperPattern, "");

      if (
        target.startsWith("#") ||
        markdownLinkRules.externalSchemePattern.test(target)
      ) {
        continue;
      }

      targets.push(target);
    }

    return Object.freeze(targets);
  }
}
