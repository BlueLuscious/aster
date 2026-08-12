import { decisionRecordRules } from "../constants/decision-record-rules.constant.mjs";
import { documentationHierarchy } from "../constants/documentation-hierarchy.constant.mjs";

/**
 * @description Inspects canonical decision record identity, status, structure, and index membership.
 */
export class DecisionRecordInspector {
  /**
   * @description Repository text acquisition capability used when the decision index is absent.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Repository path composition, containment, and presentation capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a canonical decision-record inspector.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Repository text acquisition capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, paths) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Inspects every canonical decision record after document-level policies.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after all decision records are inspected.
   */
  async inspect(context, issues) {
    const decisionRoot = this.#paths.resolve(
      context.documentationRoot,
      documentationHierarchy.decisions,
    );
    const decisionIndexPath = this.#paths.resolve(
      decisionRoot,
      documentationHierarchy.index,
    );
    const decisionIndexDocument = context.documents.find(
      (document) => this.#paths.resolve(document.path) === decisionIndexPath,
    );
    const decisionIndex =
      decisionIndexDocument?.content ??
      (await this.#fileSystem.readText(decisionIndexPath));

    for (const document of context.documents) {
      if (!this.#paths.contains(decisionRoot, document.path)) {
        continue;
      }

      const filename = this.#paths
        .display(context.workspaceRoot, document.path)
        .split("/")
        .at(-1);

      if (
        filename === documentationHierarchy.index ||
        filename === documentationHierarchy.template
      ) {
        continue;
      }

      const filenameMatch = decisionRecordRules.filenamePattern.exec(filename);

      if (!filenameMatch) {
        issues.add(
          `Decision record has an invalid filename: ${this.#paths.display(context.workspaceRoot, document.path)}`,
        );
        continue;
      }

      const identifier = filenameMatch[1];
      const headingPattern = new RegExp(`^# ${identifier}:\\s+\\S`, "mu");
      const statusMatch = decisionRecordRules.statusPattern.exec(document.content);

      if (!headingPattern.test(document.content)) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} has no matching decision heading`,
        );
      }

      if (
        !statusMatch ||
        !decisionRecordRules.acceptedStatuses.includes(statusMatch[1])
      ) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} has no accepted decision status`,
        );
      }

      if (!document.content.includes(decisionRecordRules.consequencesHeading)) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} has no consequences section`,
        );
      }

      if (!decisionIndex.includes(`](${filename})`)) {
        issues.add(
          `${this.#paths.display(context.workspaceRoot, document.path)} is missing from the decision index`,
        );
      }
    }
  }
}
