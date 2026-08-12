/**
 * @description Collects architecture findings in deterministic inspection order.
 */
export class ArchitectureIssueCollector {
  /**
   * @description Mutable collector-owned findings in inspection order.
   * @type {string[]}
   */
  #issues = [];

  /**
   * @description Appends one stable architecture finding.
   * @param {string} issue - Complete user-facing architecture finding.
   * @returns {void} This operation mutates only collector-owned state.
   */
  add(issue) {
    this.#issues.push(issue);
  }

  /**
   * @description Creates an immutable snapshot of all accumulated findings.
   * @returns {readonly string[]} Findings in inspection order.
   */
  snapshot() {
    return Object.freeze([...this.#issues]);
  }
}
