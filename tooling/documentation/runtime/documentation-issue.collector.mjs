/**
 * @description Collects documentation findings in deterministic inspection order.
 */
export class DocumentationIssueCollector {
  /**
   * @description Mutable collector-owned findings in inspection order.
   * @type {string[]}
   */
  #issues = [];

  /**
   * @description Appends one stable documentation finding.
   * @param {string} issue - Complete user-facing documentation finding.
   * @returns {void} This operation mutates only collector-owned state.
   */
  add(issue) {
    this.#issues.push(issue);
  }

  /**
   * @description Copies all accumulated documentation findings.
   * @returns {string[]} Findings in inspection order.
   */
  snapshot() {
    return [...this.#issues];
  }
}
