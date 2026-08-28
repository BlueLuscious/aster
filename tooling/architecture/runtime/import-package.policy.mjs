import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";

/**
 * @description Enforces private Import package dependency, parser, export, and compiler architecture.
 */
export class ImportPackagePolicy {
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
   * @description Creates the Import package policy.
   * @param {import("./portable-compiler.policy.mjs").PortableCompilerPolicy} compiler - Portable compiler policy.
   * @param {import("./root-package-export.policy.mjs").RootPackageExportPolicy} rootExport - Root export policy.
   */
  constructor(compiler, rootExport) {
    this.#compiler = compiler;
    this.#rootExport = rootExport;
  }

  /**
   * @description Inspects Import privacy, dependencies, parser pinning, exports, and compiler options.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired Import package record.
   * @param {Record<string, string>} dependencies - Combined production dependencies.
   * @param {ReadonlySet<string>} workspaceDependencies - Direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after Import policy is inspected.
   */
  async inspect(record, dependencies, workspaceDependencies, issues) {
    if (record.manifest.private !== true) {
      issues.add("@aster/import must remain a private adoption package");
    }

    for (const name of workspaceDependencies) {
      if (name !== packageBoundaries.names.core) {
        issues.add(`@aster/import cannot depend on workspace package ${name}`);
      }
    }

    for (const name of Object.keys(dependencies)) {
      if (!packageBoundaries.importDependencies.includes(name)) {
        issues.add(`@aster/import cannot declare unaccepted production dependency ${name}`);
      }
    }

    if (dependencies[packageBoundaries.parser.dependency] !== packageBoundaries.parser.version) {
      issues.add("@aster/import must pin the accepted xmlsax-typescript parser at 1.0.0");
    }

    this.#rootExport.inspect("@aster/import", record.manifest, issues);
    await this.#compiler.inspect(record.packageRoot, "@aster/import", issues);
  }
}
