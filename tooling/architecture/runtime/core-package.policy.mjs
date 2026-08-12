import { sourceModule } from "../constants/source-module.constant.mjs";

/**
 * @description Enforces dependency-free portable Core package architecture.
 */
export class CorePackagePolicy {
  /**
   * @description Portable compiler policy shared by recognised production packages.
   * @type {import("./portable-compiler.policy.mjs").PortableCompilerPolicy}
   */
  #compiler;

  /**
   * @description Root package export policy shared by recognised public surfaces.
   * @type {import("./root-package-export.policy.mjs").RootPackageExportPolicy}
   */
  #rootExport;

  /**
   * @description Creates the Core package policy.
   * @param {import("./portable-compiler.policy.mjs").PortableCompilerPolicy} compiler - Portable compiler policy.
   * @param {import("./root-package-export.policy.mjs").RootPackageExportPolicy} rootExport - Root export policy.
   */
  constructor(compiler, rootExport) {
    this.#compiler = compiler;
    this.#rootExport = rootExport;
  }

  /**
   * @description Inspects Core dependency, export, and compiler boundaries.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired Core package record.
   * @param {Record<string, string>} dependencies - Combined production dependencies.
   * @param {ReadonlySet<string>} workspaceDependencies - Direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after Core policy is inspected.
   */
  async inspect(record, dependencies, workspaceDependencies, issues) {
    if (workspaceDependencies.size > 0) {
      issues.add("@aster/core cannot depend on another workspace package");
    }

    for (const name of Object.keys(dependencies)) {
      if (sourceModule.hostEcosystemPackagePattern.test(name)) {
        issues.add(`@aster/core cannot depend on host ecosystem package ${name}`);
      }
    }

    const dependencyNames = Object.keys(dependencies);

    if (dependencyNames.length > 0) {
      issues.add(
        `@aster/core cannot declare production dependencies: ${dependencyNames.sort().join(", ")}`,
      );
    }

    this.#rootExport.inspect("@aster/core", record.manifest, issues);
    await this.#compiler.inspect(record.packageRoot, "@aster/core", issues);
  }
}
