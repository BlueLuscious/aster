import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";
import { CommandLineOptionParser } from "./command-line-option.parser.js";

/**
 * @description Adapts the standalone show grammar into a host-neutral invocation.
 */
export class ShowCommandLineParser implements ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command = commandLineTokens.commands.show;

  /**
   * @description Closed exact-lookup filter parser.
   */
  readonly #options = new CommandLineOptionParser();

  /**
   * @description Parses one exact icon or collection lookup.
   * @param tokens - Command tokens beginning with `show`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured show invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    const subject = tokens[1];
    const identity = tokens[2];

    if (
      subject !== commandLineTokens.subjects.icon
      && subject !== commandLineTokens.subjects.collection
    ) {
      throw new CommandLineError(
        "expected show subject to be icon or collection",
        this.command,
      );
    }

    if (identity === undefined || identity.startsWith("--")) {
      throw new CommandLineError(
        `expected one exact ${subject} identity`,
        this.command,
      );
    }

    const options = this.#options.parse(
      tokens.slice(3),
      [commandLineTokens.options.catalogue],
      this.command,
    );

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        subject,
        identity,
        ...(options.catalogue === undefined
          ? {}
          : { catalogue: options.catalogue }),
      }),
      json,
    });
  }
}
