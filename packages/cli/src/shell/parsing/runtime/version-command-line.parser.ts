import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";

/**
 * @description Adapts the standalone version grammar into a host-neutral invocation.
 */
export class VersionCommandLineParser implements ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command = commandLineTokens.commands.version;

  /**
   * @description Parses the argument-free version command.
   * @param tokens - Command tokens beginning with `version`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured version invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    if (tokens.length !== 1) {
      throw new CommandLineError(
        "version does not accept positional arguments or command options",
        this.command,
      );
    }

    return Object.freeze({
      invocation: Object.freeze({ command: this.command }),
      json,
    });
  }
}
