import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Adapts catalogue source synchronisation to one finite process command.
 */
export class CatalogueSourceSynchronisationCommand {
  /**
   * @description Catalogue source synchronisation authority.
   */
  #synchroniser;

  /**
   * @description Process host receiving arguments, output and exit state.
   */
  #process;

  /**
   * @description Creates one catalogue source synchronisation command.
   * @param {{ synchronise(packageRoot: string, checkOnly: boolean): Promise<{ changedPaths: readonly string[], outputCount: number }> }} synchroniser - Catalogue source synchronisation authority.
   * @param {{ argv: string[], stdout: { write(value: string): unknown }, stderr: { write(value: string): unknown }, exitCode?: number }} processHost - Process capability.
   */
  constructor(synchroniser, processHost) {
    this.#synchroniser = synchroniser;
    this.#process = processHost;
  }

  /**
   * @description Executes generation or drift verification for one explicit package root.
   * @param {string} packageRoot - Absolute Icons package root.
   * @returns {Promise<void>} Completion after output or failure state is reported.
   */
  async run(packageRoot) {
    const arguments_ = this.#process.argv.slice(2);
    const checkOnly =
      arguments_.length === 1 &&
      arguments_[0] === catalogueSourceGeneration.checkArgument;

    if (arguments_.length > (checkOnly ? 1 : 0)) {
      this.#process.stderr.write(
        `Usage: ${catalogueSourceGeneration.command} [${catalogueSourceGeneration.checkArgument}]\n`,
      );
      this.#process.exitCode = 1;
      return;
    }

    try {
      const result = await this.#synchroniser.synchronise(
        packageRoot,
        checkOnly,
      );

      if (checkOnly && result.changedPaths.length > 0) {
        this.#process.stderr.write(
          `Catalogue source verification failed:\n${result.changedPaths.map((path) => `- ${path}`).join("\n")}\nRun ${catalogueSourceGeneration.command}.\n`,
        );
        this.#process.exitCode = 1;
        return;
      }

      const action = checkOnly ? "verified" : "synchronised";
      this.#process.stdout.write(
        `Catalogue sources ${action}: ${result.outputCount} generated files, ${result.changedPaths.length} changed.\n`,
      );
    } catch (error) {
      this.#process.stderr.write(
        error instanceof CatalogueSourceError
          ? `Catalogue source synchronisation failed: ${error.message}\n`
          : "Catalogue source synchronisation failed.\n",
      );
      this.#process.exitCode = 1;
    }
  }
}
