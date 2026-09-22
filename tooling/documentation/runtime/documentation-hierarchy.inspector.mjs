import { documentationHierarchy } from "../constants/documentation-hierarchy.constant.mjs";

/**
 * @description Inspects required canonical documentation entry points.
 */
export class DocumentationHierarchyInspector {
  /**
   * @description Repository filesystem inspection capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Repository path composition and presentation capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a canonical hierarchy inspector.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Filesystem inspection capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, paths) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Inspects every required canonical documentation entry.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after every required entry is inspected.
   */
  async inspect(context, issues) {
    for (const entry of documentationHierarchy.requiredEntries) {
      const path = this.#paths.resolve(context.documentationRoot, entry);

      if (!(await this.#fileSystem.exists(path))) {
        issues.add(
          `Missing canonical documentation entry: ${this.#paths.display(context.workspaceRoot, path)}`,
        );
      }
    }
  }
}
