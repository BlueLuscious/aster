import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";

/**
 * @description Enforces public CLI package dependencies, exports, and compiler architecture.
 */
export class CliPackagePolicy {
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
   * @description Creates the CLI package policy.
   * @param {import("./portable-compiler.policy.mjs").PortableCompilerPolicy} compiler - Portable compiler policy.
   * @param {import("./root-package-export.policy.mjs").RootPackageExportPolicy} rootExport - Root export policy.
   */
  constructor(compiler, rootExport) {
    this.#compiler = compiler;
    this.#rootExport = rootExport;
  }

  /**
   * @description Inspects CLI visibility, dependencies, exports, and compiler options.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired CLI package record.
   * @param {Record<string, string>} dependencies - Combined production dependencies.
   * @param {ReadonlySet<string>} workspaceDependencies - Direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after CLI policy is inspected.
   */
  async inspect(record, dependencies, workspaceDependencies, issues) {
    for (const name of workspaceDependencies) {
      if (!packageBoundaries.cliDependencies.includes(name)) {
        issues.add(`@aster/cli cannot depend on workspace package ${name}`);
      }
    }

    for (const name of Object.keys(dependencies)) {
      if (!packageBoundaries.cliDependencies.includes(name)) {
        issues.add(`@aster/cli cannot declare unaccepted production dependency ${name}`);
      }
    }

    if (record.manifest.private === true) {
      issues.add("@aster/cli must remain a public package");
    }

    this.#rootExport.inspect("@aster/cli", record.manifest, issues);
    await this.#compiler.inspect(record.packageRoot, "@aster/cli", issues);
  }
}
