/**
 * @description Adapts guarded package output cleanup to command-line process capabilities.
 */
export class PackageOutputCleanupCommand {
  /**
   * @description Guarded package output cleaner invoked by the command.
   * @type {import("./package-output.cleaner.mjs").PackageOutputCleaner}
   */
  #cleaner;

  /**
   * @description Process capability supplying arguments, working directory, output, and exit state.
   */
  #process;

  /**
   * @description Creates a package output cleanup command adapter.
   * @param {import("./package-output.cleaner.mjs").PackageOutputCleaner} cleaner - Guarded cleanup authority.
   * @param {{ argv: string[], cwd(): string, stderr: { write(value: string): unknown }, exitCode?: number }} processCapability - Narrow process capability.
   */
  constructor(cleaner, processCapability) {
    this.#cleaner = cleaner;
    this.#process = processCapability;
  }

  /**
   * @description Cleans the requested package output and translates failures to process state.
   * @returns {Promise<void>} Completion after cleanup or diagnostic emission.
   */
  async run() {
    const outputDirectory = this.#process.argv[2];

    if (outputDirectory === undefined) {
      this.#fail("Package cleanup requires an output directory.");
      return;
    }

    try {
      await this.#cleaner.clean(this.#process.cwd(), outputDirectory);
    } catch (error) {
      this.#fail(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * @description Emits one command diagnostic and marks process execution as failed.
   * @param {string} message - Stable human-readable failure message.
   * @returns {void} Nothing.
   */
  #fail(message) {
    this.#process.stderr.write(`${message}\n`);
    this.#process.exitCode = 1;
  }
}
