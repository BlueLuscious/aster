import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";

/**
 * @description Enforces one side-effect-free ESM and declaration package-root export.
 */
export class RootPackageExportPolicy {
  /**
   * @description Inspects one package manifest root surface.
   * @param {string} packageName - Package identity used in findings.
   * @param {Record<string, unknown>} manifest - Parsed package manifest.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after package-root policy is inspected.
   */
  inspect(packageName, manifest, issues) {
    if (manifest.sideEffects !== false) {
      issues.add(`${packageName} must declare package.json#sideEffects as false`);
    }

    const exports = manifest.exports;
    const exportKeys =
      typeof exports === "object" && exports !== null ? Object.keys(exports) : [];
    const rootExport =
      typeof exports === "object" && exports !== null
        ? exports[packageBoundaries.rootExport.key]
        : undefined;

    if (JSON.stringify(exportKeys) !== JSON.stringify([packageBoundaries.rootExport.key])) {
      issues.add(`${packageName} must expose only the root "." package export`);
    }

    if (
      typeof rootExport !== "object" ||
      rootExport === null ||
      rootExport.import !== packageBoundaries.rootExport.import ||
      rootExport.types !== packageBoundaries.rootExport.types
    ) {
      issues.add(
        `${packageName} root export must provide the accepted ESM and declaration entries`,
      );
    }
  }
}
