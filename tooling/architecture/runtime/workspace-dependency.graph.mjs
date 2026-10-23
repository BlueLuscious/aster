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
   * @remarks Depth-first traversal reports back edges in the active dependency path and skips completed packages.
   * @param {import("../contracts/internal/architecture-issue-collector.contract.mjs").IArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after every package has been traversed.
   */
  inspectCycles(issues) {
    const visited = new Set();
    const active = new Set();

    /** @type {(name: string, trail: readonly string[]) => void} */
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
