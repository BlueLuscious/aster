import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";
import { catalogueSourceGeneration } from "../../catalogue/constants/catalogue-source-generation.constant.mjs";
import { catalogueSourceFamilyKinds } from "../../catalogue/constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceFacadeResolver } from "../../catalogue/runtime/catalogue-source-facade.resolver.mjs";

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
   * @param {Record<string, unknown>} dependencies - Combined production dependencies.
   * @param {ReadonlySet<string>} workspaceDependencies - Direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after Icons policy is inspected.
   */
  async inspect(record, dependencies, workspaceDependencies, issues) {
    for (const name of workspaceDependencies) {
      if (!packageBoundaries.iconsDependencies.includes(name)) {
        issues.add(`@luscious-garden/aster-icons cannot depend on workspace package ${name}`);
      }
    }

    for (const name of Object.keys(dependencies)) {
      if (!packageBoundaries.iconsDependencies.includes(name)) {
        issues.add(
          `@luscious-garden/aster-icons cannot declare unaccepted production dependency ${name}`,
        );
      }
    }

    if (record.manifest.private === true) {
      issues.add("@luscious-garden/aster-icons must remain a public package");
    }

    if (record.manifest.sideEffects !== false) {
      issues.add("@luscious-garden/aster-icons must declare package.json#sideEffects as false");
    }

    const exports = record.manifest.exports;
    const iconFamily = catalogueSourceGeneration.families.find(({kind}) => kind === catalogueSourceFamilyKinds.icon);
    const facades = new CatalogueSourceFacadeResolver();
    const isObject = typeof exports === "object" && exports !== null && !Array.isArray(exports);
    const entries = isObject ? Object.entries(exports) : [];
    const treatments = entries.filter(([key]) => key.startsWith("./*/"));
    const fixed = Object.fromEntries(entries.filter(([key]) => !key.startsWith("./*/")));
    if (
      !isObject || !iconFamily || treatments.length === 0
      || JSON.stringify(fixed) !== JSON.stringify(packageBoundaries.iconsExports)
      || treatments.some(([key, target]) =>
        !new RegExp(catalogueSourceGeneration.slugPatternSource, "u").test(key.slice(4))
        || JSON.stringify(target) !== JSON.stringify(facades.exportTarget(iconFamily, key.slice(4))),
      )
    ) {
      issues.add(
        "@luscious-garden/aster-icons must expose only the accepted scalable package exports",
      );
    }

    await this.#compiler.inspect(record.packageRoot, "@luscious-garden/aster-icons", issues);
  }
}
