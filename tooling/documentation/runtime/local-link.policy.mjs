/**
 * @description Resolves canonical local links and rejects escapes or absent targets.
 */
export class LocalLinkPolicy {
  /**
   * @description Repository filesystem inspection capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Local Markdown link target extractor.
   * @type {import("./markdown-link-target.extractor.mjs").MarkdownLinkTargetExtractor}
   */
  #links;

  /**
   * @description Repository path composition and containment capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a canonical local-link policy.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Filesystem inspection capability.
   * @param {import("./markdown-link-target.extractor.mjs").MarkdownLinkTargetExtractor} links - Local link target extractor.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, links, paths) {
    this.#fileSystem = fileSystem;
    this.#links = links;
    this.#paths = paths;
  }

  /**
   * @description Inspects every local link target in one canonical document.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("../types/internal/canonical-document.type.mjs").TCanonicalDocument} document - Acquired canonical document.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after all local links are resolved.
   */
  async inspect(context, document, issues) {
    for (const target of this.#links.extract(document.content)) {
      const targetWithoutFragment = decodeURIComponent(target.split("#", 1)[0]);
      const resolvedTarget = this.#paths.resolve(
        this.#paths.dirname(document.path),
        targetWithoutFragment,
      );

      if (!this.#paths.contains(context.workspaceRoot, resolvedTarget)) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} links outside the repository: ${target}`,
        );
      } else if (!(await this.#fileSystem.exists(resolvedTarget))) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} contains a broken local link: ${target}`,
        );
      }
    }
  }
}
