import { localReferenceRules } from "../constants/local-reference-rules.constant.mjs";

/**
 * @description Rejects contributor-local references from canonical documentation.
 */
export class LocalReferencePolicy {
  /**
   * @description Repository path presentation capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a canonical local-reference policy.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(paths) {
    this.#paths = paths;
  }

  /**
   * @description Inspects one document for forbidden local-only references.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("../types/internal/canonical-document.type.mjs").TCanonicalDocument} document - Acquired canonical document.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after all local-reference rules are applied.
   */
  inspect(context, document, issues) {
    for (const reference of localReferenceRules) {
      if (reference.pattern.test(document.content)) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} contains ${reference.label}`,
        );
      }
    }
  }
}
