import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import { isAsterCommandName } from "../../../command/runtime/is-aster-command-name.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";

/**
 * @description Adapts the standalone help grammar into a host-neutral invocation.
 */
export class HelpCommandLineParser implements ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command = commandLineTokens.commands.help;

  /**
   * @description Parses complete or command-specific help selection.
   * @param tokens - Command tokens beginning with `help`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured help invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    if (tokens.length > 2) {
      throw new CommandLineError(
        "help accepts at most one command name",
        this.command,
      );
    }

    const commandName = tokens[1];

    if (
      commandName !== undefined
      && !isAsterCommandName(commandName)
    ) {
      throw new CommandLineError(
        "help command must identify an accepted command",
        this.command,
      );
    }

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        ...(commandName === undefined ? {} : { commandName }),
      }),
      json,
    });
  }
}
