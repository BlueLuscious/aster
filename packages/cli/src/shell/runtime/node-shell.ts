import { AsterCatalogue, AsterCommands } from "../../index.js";
import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { TShellExecution } from "../types/internal/shell-execution.type.js";
import { CommandLineError } from "./command-line.error.js";
import { CommandLineParser } from "./command-line.parser.js";
import { CommandOutputPresenter } from "./command-output.presenter.js";
import { ShellDiagnosticFactory } from "./shell-diagnostic.factory.js";

/**
 * @description Coordinates argv adaptation, explicit Aster composition, and pure presentation.
 */
export class NodeShell {
  /**
   * @description Standalone argv adapter.
   */
  readonly #parser = new CommandLineParser();

  /**
   * @description Structured result to stream-effect presenter.
   */
  readonly #output = new CommandOutputPresenter();

  /**
   * @description Shell-owned fault to structured diagnostic adapter.
   */
  readonly #diagnostics = new ShellDiagnosticFactory();

  /**
   * @description Explicit immutable command context owned by this executable composition.
   */
  readonly #context;

  /**
   * @description Creates one standalone shell with explicit product metadata.
   * @param productName - Stable product name for the version command.
   * @param productVersion - Installed package version for the version command.
   */
  constructor(productName: string, productVersion: string) {
    this.#context = Object.freeze({
      catalogues: Object.freeze([AsterCatalogue]),
      productName,
      productVersion,
    });
  }

  /**
   * @description Executes one supplied argv sequence without directly mutating process state.
   * @param argv - Tokens following the executable and script paths.
   * @returns Complete stream effects and exit status for the entrypoint to commit.
   */
  async execute(argv: readonly string[]): Promise<TShellExecution> {
    const json = argv.includes(commandLineTokens.options.json);

    try {
      const parsed = this.#parser.parse(argv);
      const result = await AsterCommands.execute(parsed.invocation, this.#context);
      return this.#output.present(result, parsed.json);
    } catch (error) {
      const result = error instanceof CommandLineError
        ? this.#diagnostics.usage(error)
        : this.#diagnostics.unexpected();
      return this.#output.present(result, json);
    }
  }
}
