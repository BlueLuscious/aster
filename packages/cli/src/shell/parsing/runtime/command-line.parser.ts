import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { AsciiStringComparator } from "../../../shared/runtime/ascii-string.comparator.js";
import { CommandLineError } from "./command-line.error.js";
import { ExportCommandLineParser } from "./export-command-line.parser.js";
import { HelpCommandLineParser } from "./help-command-line.parser.js";
import { ListCommandLineParser } from "./list-command-line.parser.js";
import { SearchCommandLineParser } from "./search-command-line.parser.js";
import { ShowCommandLineParser } from "./show-command-line.parser.js";
import { VersionCommandLineParser } from "./version-command-line.parser.js";

/**
 * @description Dispatches standalone argv adaptation to explicit command-owned parsers.
 */
export class CommandLineParser {
  /**
   * @description Explicit immutable command parsers indexed by unique command identity.
   */
  readonly #parsers: ReadonlyMap<string, ICommandLineCommandParser>;

  /**
   * @description Creates the standalone dispatcher from the closed initial parser family.
   */
  constructor() {
    const parsers: readonly ICommandLineCommandParser[] = [
      new ExportCommandLineParser(),
      new ListCommandLineParser(),
      new SearchCommandLineParser(),
      new ShowCommandLineParser(),
      new HelpCommandLineParser(),
      new VersionCommandLineParser(),
    ];
    const ascii = new AsciiStringComparator();
    const entries = parsers
      .map((parser) => [parser.command, parser] as const)
      .sort(([left], [right]) => ascii.compare(left, right));

    if (new Set(entries.map(([command]) => command)).size !== entries.length) {
      throw new TypeError("Duplicate command-line parser");
    }

    this.#parsers = new Map(entries);
  }

  /**
   * @description Parses one executable argument sequence without reading process state.
   * @param argv - Tokens following the executable and script paths.
   * @returns Accepted immutable invocation and presentation selection.
   */
  parse(argv: readonly string[]): TParsedCommandLine {
    const [tokens, json] = this.#extractPresentation(argv);
    const command = tokens[0] ?? commandLineTokens.commands.help;
    const parser = this.#parsers.get(command);

    if (parser === undefined) {
      throw new CommandLineError(`unknown command ${JSON.stringify(command)}`);
    }

    return parser.parse(
      tokens.length === 0 ? Object.freeze([command]) : tokens,
      json,
    );
  }

  /**
   * @description Extracts the shell-only JSON flag once without changing command token order.
   * @param argv - Complete candidate argument sequence.
   * @returns Remaining command tokens and whether JSON presentation was requested.
   */
  #extractPresentation(
    argv: readonly string[],
  ): readonly [readonly string[], boolean] {
    const tokens: string[] = [];
    let json = false;

    for (const token of argv) {
      if (token !== commandLineTokens.options.json) {
        tokens.push(token);
        continue;
      }

      if (json) {
        throw new CommandLineError("option --json cannot be repeated");
      }

      json = true;
    }

    return Object.freeze([Object.freeze(tokens), json]);
  }
}
