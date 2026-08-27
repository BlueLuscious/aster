import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";
import { CommandLineOptionParser } from "./command-line-option.parser.js";

/**
 * @description Adapts the standalone search grammar into a host-neutral invocation.
 */
export class SearchCommandLineParser implements ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command = commandLineTokens.commands.search;

  /**
   * @description Closed search-filter parser.
   */
  readonly #options = new CommandLineOptionParser();

  /**
   * @description Parses one exact search query and its accepted filters.
   * @param tokens - Command tokens beginning with `search`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured search invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    const query = tokens[1];

    if (query === undefined || query.startsWith("--")) {
      throw new CommandLineError(
        "expected search query as one non-empty argument",
        this.command,
      );
    }

    const options = this.#options.parse(
      tokens.slice(2),
      [
        commandLineTokens.options.catalogue,
        commandLineTokens.options.collection,
        commandLineTokens.options.tag,
      ],
      this.command,
    );

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        query,
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
