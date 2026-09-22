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
    const exportRecord = typeof exports === "object" && exports !== null
      ? /** @type {Record<string, unknown>} */ (exports)
      : undefined;
    const exportKeys =
      exportRecord === undefined ? [] : Object.keys(exportRecord);
    const rootExport = exportRecord?.[packageBoundaries.rootExport.key];
    const rootExportRecord = typeof rootExport === "object" && rootExport !== null
      ? /** @type {Record<string, unknown>} */ (rootExport)
      : undefined;

    if (JSON.stringify(exportKeys) !== JSON.stringify([packageBoundaries.rootExport.key])) {
      issues.add(`${packageName} must expose only the root "." package export`);
    }

    if (
      rootExportRecord === undefined ||
      rootExportRecord.import !== packageBoundaries.rootExport.import ||
      rootExportRecord.types !== packageBoundaries.rootExport.types
    ) {
      issues.add(
        `${packageName} root export must provide the accepted ESM and declaration entries`,
      );
    }
  }
}
