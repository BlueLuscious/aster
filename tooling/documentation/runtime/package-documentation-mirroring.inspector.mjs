import { documentationHierarchy } from "../constants/documentation-hierarchy.constant.mjs";

/**
 * @description Inspects package documentation membership against real workspace packages.
 */
export class PackageDocumentationMirroringInspector {
  /**
   * @description Optional repository directory membership reader.
   * @type {import("../../shared/runtime/repository-directory.reader.mjs").RepositoryDirectoryReader}
   */
  #directories;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a package documentation mirroring inspector.
   * @param {import("../../shared/runtime/repository-directory.reader.mjs").RepositoryDirectoryReader} directories - Optional directory membership reader.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(directories, paths) {
    this.#directories = directories;
    this.#paths = paths;
  }

  /**
   * @description Compares source package and package documentation membership.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after both member sets are compared.
   */
  async inspect(context, issues) {
    const sourceMembers = await this.#directories.read(
      this.#paths.resolve(context.workspaceRoot, documentationHierarchy.packages),
    );
    const documentedMembers = await this.#directories.read(
      this.#paths.resolve(context.documentationRoot, documentationHierarchy.packages),
    );

    for (const member of sourceMembers) {
      if (!documentedMembers.includes(member)) {
        issues.add(`Missing packages documentation for repository member: ${member}`);
      }
    }

    for (const member of documentedMembers) {
      if (!sourceMembers.includes(member)) {
        issues.add(`Documentation describes a missing packages member: ${member}`);
      }
    }
  }
}
