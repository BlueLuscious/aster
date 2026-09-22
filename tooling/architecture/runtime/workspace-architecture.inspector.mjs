import { compilerBaseline } from "../constants/compiler-baseline.constant.mjs";
import { repositoryArchitecturePaths } from "../constants/repository-architecture-paths.constant.mjs";

/**
 * @description Inspects root compiler and workspace membership architecture.
 */
export class WorkspaceArchitectureInspector {
  /**
   * @description Repository text acquisition capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Strict repository JSON acquisition capability.
   * @type {import("../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader}
   */
  #json;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a root workspace architecture inspector.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Repository text acquisition capability.
   * @param {import("../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader} json - Strict JSON reader.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, json, paths) {
    this.#fileSystem = fileSystem;
    this.#json = json;
    this.#paths = paths;
  }

  /**
   * @description Inspects compiler baseline and equivalent workspace membership authorities.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after root workspace policy is inspected.
   */
  async inspect(workspaceRoot, issues) {
    const configuration = await this.#json.read(
      this.#paths.resolve(workspaceRoot, repositoryArchitecturePaths.workspaceConfiguration),
    );
    const options = /** @type {Record<string, unknown>} */ (
      configuration.compilerOptions ?? {}
    );

    for (const [name, expected] of Object.entries(compilerBaseline)) {
      if (JSON.stringify(options[name]) !== JSON.stringify(expected)) {
        issues.add(
          `tsconfig.base.json compilerOptions.${name} must be ${JSON.stringify(expected)}`,
        );
      }
    }

    if (options.verbatimModuleSyntax !== true) {
      issues.add("tsconfig.base.json must enable verbatimModuleSyntax");
    }

    const manifest = await this.#json.read(
      this.#paths.resolve(workspaceRoot, repositoryArchitecturePaths.workspaceManifest),
    );
    const manifestPatterns = (
      Array.isArray(manifest.workspaces)
        ? manifest.workspaces.filter((entry) => typeof entry === "string")
        : []
    ).sort((left, right) => left.localeCompare(right));
    const pnpmPatterns = this.#pnpmPatterns(
      await this.#fileSystem.readText(
        this.#paths.resolve(workspaceRoot, repositoryArchitecturePaths.pnpmWorkspace),
      ),
    );

    if (JSON.stringify(manifestPatterns) !== JSON.stringify(pnpmPatterns)) {
      issues.add(
        "package.json and pnpm-workspace.yaml must declare equivalent workspace members",
      );
    }
  }

  /**
   * @description Extracts pnpm workspace member patterns from repository YAML.
   * @param {string} source - pnpm workspace YAML source.
   * @returns {readonly string[]} Sorted member patterns.
   */
  #pnpmPatterns(source) {
    return Object.freeze(
      source
        .split(/\r?\n/gu)
        .map((line) => /^\s*-\s*["']?([^"'#]+?)["']?\s*$/u.exec(line)?.[1]?.trim())
        .filter((pattern) => pattern !== undefined)
        .sort((left, right) => left.localeCompare(right)),
    );
  }
}
