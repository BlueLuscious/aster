import { ArchitectureIssueCollector } from "./architecture-issue.collector.mjs";

/**
 * @description Coordinates independent architecture inspectors for one explicit workspace root.
 */
export class ArchitectureVerifier {
  /**
   * @description Ordered architecture responsibility inspectors.
   * @type {readonly import("../contracts/internal/architecture-inspector.contract.mjs").IArchitectureInspector[]}
   */
  #inspectors;

  /**
   * @description Creates an architecture verifier with deterministic inspector order.
   * @param {readonly import("../contracts/internal/architecture-inspector.contract.mjs").IArchitectureInspector[]} inspectors - Ordered architecture responsibility inspectors.
   */
  constructor(inspectors) {
    this.#inspectors = Object.freeze([...inspectors]);
  }

  /**
   * @description Verifies accepted repository architecture for one explicit workspace.
   * @param {string} workspaceRoot - Absolute repository root to verify.
   * @returns {Promise<readonly string[]>} Architecture findings in deterministic inspection order.
   */
  async verify(workspaceRoot) {
    const issues = new ArchitectureIssueCollector();

    for (const inspector of this.#inspectors) {
      await inspector.inspect(workspaceRoot, issues);
    }

    return issues.snapshot();
  }
}
