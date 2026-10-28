import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import process from "node:process";

import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Invokes the existing Icons build using the current pnpm host without a command shell.
 */
export class NodeCatalogueIconRemovalBuild {
  /** @description Explicit workspace used as the subprocess working directory. */
  #root;
  /** @description Current pnpm JavaScript entrypoint, captured before source changes. */
  #runner;

  /**
   * @description Creates a build host without executing a subprocess or installing dependencies.
   * @param {string} workspaceRoot - Explicit checkout containing already-built Core.
   */
  constructor(workspaceRoot) {
    this.#root = resolve(workspaceRoot);
    this.#runner = process.env.npm_execpath;
  }

  /**
   * @description Requires pnpm's current host and already-built Core before allowing source mutation.
   * @returns {Promise<void>} Existing finite build prerequisites.
   */
  async prepare() {
    if (this.#runner === undefined || !isAbsolute(this.#runner) || !/\.(?:c?js|mjs)$/u.test(this.#runner) || !(await stat(this.#runner)).isFile()) {
      throw new CatalogueSourceError("Apply must run through pnpm's remove:icon script; its JavaScript host is unavailable.");
    }
    for (const path of ["packages/core/dist/index.js", "packages/core/dist/index.d.ts"]) {
      if (!(await stat(resolve(this.#root, path))).isFile()) {
        throw new CatalogueSourceError(`Build Core before applying icon removal: ${path}`);
      }
    }
  }

  /**
   * @description Runs the existing generation, owned output cleanup and TypeScript compilation unchanged.
   * @returns {Promise<void>} Successful existing build; nonzero status is an incomplete output stage.
   */
  async run() {
    const runner = this.#runner;
    if (runner === undefined) {
      throw new CatalogueSourceError("The prepared pnpm build host is unavailable.");
    }
    await new Promise((resolveBuild, reject) => {
      const child = spawn(process.execPath, [runner, "--dir", "packages/icons", "run", "build"], { cwd: this.#root, stdio: "inherit", windowsHide: true });
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (code === 0) {
          resolveBuild(undefined);
        } else {
          reject(new CatalogueSourceError(`Icons build failed (${signal ?? code}); generated/emitted work is incomplete.`));
        }
      });
    });
  }
}
