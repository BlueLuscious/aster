/**
 * @description Applies ordered document policies to every acquired canonical Markdown document.
 */
export class CanonicalDocumentInspector {
  /**
   * @description Ordered canonical document policies.
   * @type {readonly import("../contracts/internal/canonical-document-policy.contract.mjs").ICanonicalDocumentPolicy[]}
   */
  #policies;

  /**
   * @description Creates a canonical document inspector with stable policy order.
   * @param {readonly import("../contracts/internal/canonical-document-policy.contract.mjs").ICanonicalDocumentPolicy[]} policies - Ordered canonical document policies.
   */
  constructor(policies) {
    this.#policies = Object.freeze([...policies]);
  }

  /**
   * @description Applies every policy to each document before advancing to the next document.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after all documents and policies are inspected.
   */
  async inspect(context, issues) {
    for (const document of context.documents) {
      for (const policy of this.#policies) {
        await policy.inspect(context, document, issues);
      }
    }
  }
}
