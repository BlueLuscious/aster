/**
 * @description Internal policy for one recognised Aster workspace package.
 * @typedef {object} IPackageArchitecturePolicy
 * @property {(record: import("../../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord, dependencies: Record<string, string>, workspaceDependencies: ReadonlySet<string>, issues: import("../../runtime/architecture-issue.collector.mjs").ArchitectureIssueCollector) => Promise<void>} inspect - Applies package-owned architecture policy.
 */

export {};
