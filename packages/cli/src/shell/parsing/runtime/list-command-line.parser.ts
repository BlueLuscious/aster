import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";
import { CommandLineOptionParser } from "./command-line-option.parser.js";

/**
 * @description Adapts the standalone list grammar into a host-neutral invocation.
 */
export class ListCommandLineParser implements ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command = commandLineTokens.commands.list;

  /**
   * @description Closed list-filter parser.
   */
  readonly #options = new CommandLineOptionParser();

  /**
   * @description Parses provider, collection, or icon listing and its exact filters.
   * @param tokens - Command tokens beginning with `list`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured list invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    const subject = tokens[1];

    if (
      subject !== commandLineTokens.subjects.catalogues
      && subject !== commandLineTokens.subjects.collections
      && subject !== commandLineTokens.subjects.icons
    ) {
      throw new CommandLineError(
        "expected list subject to be catalogues, collections, or icons",
        this.command,
      );
    }

    const acceptedOptions = subject === commandLineTokens.subjects.catalogues
      ? []
      : subject === commandLineTokens.subjects.collections
        ? [commandLineTokens.options.catalogue]
        : [
            commandLineTokens.options.catalogue,
            commandLineTokens.options.collection,
            commandLineTokens.options.tag,
          ];
    const options = this.#options.parse(
      tokens.slice(2),
      acceptedOptions,
      this.command,
    );

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        subject,
        ...(options.catalogue === undefined
          ? {}
          : { catalogue: options.catalogue }),
        ...(options.collection === undefined
          ? {}
          : { collection: options.collection }),
        ...(options.tags.length === 0
          ? {}
          : { tags: Object.freeze(options.tags) }),
      }),
      json,
    });
  }
}
