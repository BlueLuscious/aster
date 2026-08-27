import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import { AsterCatalogue, AsterCommands } from "../../index.js";
import { ExportOutputError } from "../output/runtime/export-output.error.js";
import { ExportOutputPathResolver } from "../output/runtime/export-output-path.resolver.js";
import { ExportOutputPublisher } from "../output/runtime/export-output.publisher.js";
import { NodeExportOutputFileSystem } from "../output/runtime/node-export-output-file-system.js";
import { commandLineTokens } from "../parsing/constants/command-line-tokens.constant.js";
import { CommandLineError } from "../parsing/runtime/command-line.error.js";
import { CommandLineParser } from "../parsing/runtime/command-line.parser.js";
import { CommandOutputPresenter } from "../presentation/runtime/command-output.presenter.js";
import type { TShellExecution } from "../presentation/types/internal/shell-execution.type.js";
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
   * @description Private Node output composition applied only to complete export plans.
   */
  readonly #publisher = new ExportOutputPublisher(
    new NodeExportOutputFileSystem(),
    new ExportOutputPathResolver(),
  );

  /**
   * @description Explicit absolute host directory used for output-root resolution.
   */
  readonly #currentDirectory: string;

  /**
   * @description Explicit immutable command context owned by this executable composition.
   */
  readonly #context;

  /**
   * @description Creates one standalone shell with explicit product metadata.
   * @param productName - Stable product name for the version command.
   * @param productVersion - Installed package version for the version command.
   * @param currentDirectory - Explicit absolute host directory for output resolution.
   */
  constructor(
    productName: string,
    productVersion: string,
    currentDirectory: string,
  ) {
    this.#currentDirectory = currentDirectory;
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

      if (
        parsed.output !== undefined
        && result.ok
        && result.payload.kind === asterCommandPayloadKinds.export
      ) {
        const publication = await this.#publisher.publish(
          result.payload.plan,
          this.#currentDirectory,
          parsed.output,
        );
        return this.#output.presentPublication(publication);
      }

      return this.#output.present(result, parsed.json);
    } catch (error) {
      const result = error instanceof CommandLineError
        ? this.#diagnostics.usage(error)
        : error instanceof ExportOutputError
          ? this.#diagnostics.output(error)
        : this.#diagnostics.unexpected();
      return this.#output.present(result, json);
    }
  }
}
