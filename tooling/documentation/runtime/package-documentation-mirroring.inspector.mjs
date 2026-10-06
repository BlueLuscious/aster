import { documentationHierarchy } from "../constants/documentation-hierarchy.constant.mjs";

/**
 * @description Inspects package and authored feature documentation against workspace sources.
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
   * @description Compares source packages and their authored features with documentation.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after package and authored feature membership is compared.
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
        continue;
      }

      await this.#inspectFeatures(context, member, issues);
    }

    for (const member of documentedMembers) {
      if (!sourceMembers.includes(member)) {
        issues.add(`Documentation describes a missing packages member: ${member}`);
      }
    }
  }

  /**
   * @description Compares one package's authored feature roots with its feature documentation.
   * @param {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} context - Documentation verification context.
   * @param {string} member - Workspace package directory name.
   * @param {import("./documentation-issue.collector.mjs").DocumentationIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after feature membership is compared.
   */
  async #inspectFeatures(context, member, issues) {
    const sourceFeatures = (await this.#directories.read(
      this.#paths.resolve(context.workspaceRoot, documentationHierarchy.packages, member, "src"),
    )).filter((feature) => feature !== "generated");
    const documentedFeatures = await this.#directories.read(
      this.#paths.resolve(context.documentationRoot, documentationHierarchy.packages, member),
    );

    for (const feature of sourceFeatures) {
      if (!documentedFeatures.includes(feature)) {
        issues.add(`Missing ${member} feature documentation for source member: ${feature}`);
      }
    }

    for (const feature of documentedFeatures) {
      if (!sourceFeatures.includes(feature)) {
        issues.add(`Documentation describes a missing ${member} source feature: ${feature}`);
      }
    }
  }
}
