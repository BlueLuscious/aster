import { spawnSync } from "node:child_process";
import process from "node:process";

/**
 * @description Executes fresh Node processes for CLI cold-start comparison evidence.
 */
export class NodeCliProcessHost {
  /** @description Absolute repository root used for package and executable resolution. */
  #repositoryRoot;

  /**
   * @description Creates one process host rooted at the explicit repository location.
   * @param {string} repositoryRoot - Absolute repository root.
   */
  constructor(repositoryRoot) {
    this.#repositoryRoot = repositoryRoot;
  }

  /**
   * @description Executes one fresh Node process and captures complete observable evidence.
   * @param {{ executablePath?: string, arguments: readonly string[] }} request - Cold process request.
   * @returns {{ elapsedNanoseconds: number, status: number | null, stdout: string, stderr: string }} Process evidence.
   */
  execute(request) {
    const arguments_ = request.executablePath === undefined
      ? request.arguments
      : [request.executablePath, ...request.arguments];
    const startedAt = process.hrtime.bigint();
    const result = spawnSync(process.execPath, arguments_, {
      cwd: this.#repositoryRoot,
      encoding: "utf8",
    });
    const elapsedNanoseconds = Number(process.hrtime.bigint() - startedAt);

    if (result.error !== undefined) {
      throw result.error;
    }

    return Object.freeze({
      elapsedNanoseconds,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  }
}
