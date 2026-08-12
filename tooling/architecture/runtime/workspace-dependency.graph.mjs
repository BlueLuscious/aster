/**
 * @description Builds workspace production dependencies and reports deterministic dependency cycles.
 */
export class WorkspaceDependencyGraph {
  /**
   * @description Direct workspace production dependencies by package identity.
   * @type {Map<string, Set<string>>}
   */
  #dependencies = new Map();

  /**
   * @description Records one package and its workspace production dependencies.
   * @param {string} packageName - Workspace package identity.
   * @param {ReadonlySet<string>} dependencies - Direct workspace dependencies.
   * @returns {void} This operation updates graph-owned state.
   */
  add(packageName, dependencies) {
    this.#dependencies.set(packageName, new Set(dependencies));
  }

  /**
   * @description Reports dependency cycles into the supplied issue collector.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after every package has been traversed.
   */
  inspectCycles(issues) {
    const visited = new Set();
    const active = new Set();

    /**
     * @description Visits one package and reports a dependency back edge.
     * @param {string} name - Workspace package being visited.
     * @param {readonly string[]} trail - Dependency path leading to the package.
     * @returns {void} This traversal updates local graph state and the issue collector.
     */
    const visit = (name, trail) => {
      if (active.has(name)) {
        issues.add(`Workspace production dependency cycle: ${[...trail, name].join(" -> ")}`);
        return;
      }

      if (visited.has(name)) {
        return;
      }

      active.add(name);

      for (const dependency of this.#dependencies.get(name) ?? []) {
        visit(dependency, [...trail, name]);
      }

      active.delete(name);
      visited.add(name);
    };

    for (const name of this.#dependencies.keys()) {
      visit(name, []);
    }
  }
}
