import type { AsterCommandInvocationType } from "../../command/types/index.js";
import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import { CommandLineError } from "./command-line.error.js";
import { CommandLineOptionParser } from "./command-line-option.parser.js";

/**
 * @description Adapts the initial standalone export grammar into a host-neutral invocation.
 */
export class ExportCommandLineParser {
  /**
   * @description Closed shared option parser used for the provider filter.
   */
  readonly #options: CommandLineOptionParser;

  /**
   * @description Creates one export parser from the shell's shared option parser.
   * @param options - Closed command-option parser.
   */
  constructor(options: CommandLineOptionParser) {
    this.#options = options;
  }

  /**
   * @description Parses one exact icon or collection export without acquiring output authority.
   * @param tokens - Command tokens beginning with `export`.
   * @param json - Whether machine-readable plan presentation was requested.
   * @returns Structured export invocation candidate.
   */
  parse(
    tokens: readonly string[],
    json: boolean,
  ): Extract<AsterCommandInvocationType, { command: "export" }> {
    const subject = tokens[1];
    const identity = tokens[2];

    if (
      subject !== commandLineTokens.subjects.icon &&
      subject !== commandLineTokens.subjects.collection
    ) {
      throw new CommandLineError(
        "expected export subject to be icon or collection",
        commandLineTokens.commands.export,
      );
    }

    if (identity === undefined || identity.startsWith("--")) {
      throw new CommandLineError(
        `expected one exact ${subject} identity`,
        commandLineTokens.commands.export,
      );
    }

    if (subject === commandLineTokens.subjects.collection && !json) {
      throw new CommandLineError(
        "collection export requires --json until an output root is supplied",
        commandLineTokens.commands.export,
      );
    }

    const options = this.#options.parse(
      tokens.slice(3),
      [commandLineTokens.options.catalogue],
      commandLineTokens.commands.export,
    );

    return {
      command: commandLineTokens.commands.export,
      subject,
      identity,
      ...(options.catalogue === undefined
        ? {}
        : { catalogue: options.catalogue }),
    };
  }
}
