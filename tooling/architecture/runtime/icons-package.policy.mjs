import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";

/**
 * @description Enforces public Icons dependencies, scalable exports, and portable compiler
 * architecture.
 */
export class IconsPackagePolicy {
  /**
   * @description Portable compiler policy shared by recognised production packages.
   * @type {import("./portable-compiler.policy.mjs").PortableCompilerPolicy}
   */
  #compiler;

  /**
   * @description Creates the Icons package policy.
   * @param {import("./portable-compiler.policy.mjs").PortableCompilerPolicy} compiler - Portable compiler policy.
   */
  constructor(compiler) {
    this.#compiler = compiler;
  }

  /**
   * @description Inspects Icons visibility, dependencies, exports, and compiler options.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired Icons package record.
   * @param {Record<string, string>} dependencies - Combined production dependencies.
   * @param {ReadonlySet<string>} workspaceDependencies - Direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after Icons policy is inspected.
   */
  async inspect(record, dependencies, workspaceDependencies, issues) {
    for (const name of workspaceDependencies) {
      if (!packageBoundaries.iconsDependencies.includes(name)) {
        issues.add(`@aster/icons cannot depend on workspace package ${name}`);
      }
    }

    for (const name of Object.keys(dependencies)) {
      if (!packageBoundaries.iconsDependencies.includes(name)) {
        issues.add(
          `@aster/icons cannot declare unaccepted production dependency ${name}`,
        );
      }
    }

    if (record.manifest.private === true) {
      issues.add("@aster/icons must remain a public package");
    }

    if (record.manifest.sideEffects !== false) {
      issues.add("@aster/icons must declare package.json#sideEffects as false");
    }

    if (
      JSON.stringify(record.manifest.exports) !==
      JSON.stringify(packageBoundaries.iconsExports)
    ) {
      issues.add(
        "@aster/icons must expose only the accepted scalable package exports",
      );
    }

    await this.#compiler.inspect(record.packageRoot, "@aster/icons", issues);
  }
}
