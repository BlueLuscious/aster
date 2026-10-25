/**
 * @description Internal policy for one recognised Aster workspace package.
 * @typedef {object} IPackageArchitecturePolicy
 * @property {(record: import("../../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord, dependencies: Record<string, unknown>, workspaceDependencies: ReadonlySet<string>, issues: import("./architecture-issue-collector.contract.mjs").IArchitectureIssueCollector) => Promise<void>} inspect - Applies package-owned architecture policy.
 */

export {};
