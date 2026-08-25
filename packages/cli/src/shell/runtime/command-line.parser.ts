import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";
import { CommandLineOptionParser } from "./command-line-option.parser.js";
import { ExportCommandLineParser } from "./export-command-line.parser.js";

/**
 * @description Adapts exact standalone argv tokens into the host-neutral invocation union.
 */
export class CommandLineParser {
  /**
   * @description Closed command-specific option parser.
   */
  readonly #options = new CommandLineOptionParser();

  /**
   * @description Command-local parser for the initial standalone export grammar.
   */
  readonly #export = new ExportCommandLineParser(this.#options);

  /**
   * @description Parses one executable argument sequence without reading process state.
   * @param argv - Tokens following the executable and script paths.
   * @returns Accepted immutable invocation and presentation selection.
   */
  parse(argv: readonly string[]): TParsedCommandLine {
    const [tokens, json] = this.#extractPresentation(argv);
    const command = tokens[0];

    if (command === undefined) {
      return Object.freeze({
        invocation: Object.freeze({ command: commandLineTokens.commands.help }),
        json,
      });
    }

    const invocation = (() => {
      switch (command) {
        case commandLineTokens.commands.export:
          return this.#export.parse(tokens, json);
        case commandLineTokens.commands.list:
          return this.#parseList(tokens);
        case commandLineTokens.commands.search:
          return this.#parseSearch(tokens);
        case commandLineTokens.commands.show:
          return this.#parseShow(tokens);
        case commandLineTokens.commands.help:
          return this.#parseHelp(tokens);
        case commandLineTokens.commands.version:
          return this.#parseVersion(tokens);
        default:
          throw new CommandLineError(`unknown command ${JSON.stringify(command)}`);
      }
    })();

    return Object.freeze({ invocation: Object.freeze(invocation), json });
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

  /**
   * @description Parses provider, collection, or icon listing and its accepted exact filters.
   * @param tokens - Command tokens beginning with `list`.
   * @returns Structured list invocation candidate.
   */
  #parseList(tokens: readonly string[]) {
    const subject = tokens[1];

    if (
      subject !== commandLineTokens.subjects.catalogues &&
      subject !== commandLineTokens.subjects.collections &&
      subject !== commandLineTokens.subjects.icons
    ) {
      throw new CommandLineError(
        "expected list subject to be catalogues, collections, or icons",
        commandLineTokens.commands.list,
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
      commandLineTokens.commands.list,
    );

    return {
      command: commandLineTokens.commands.list,
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
    } as const;
  }

  /**
   * @description Parses one exact search query and its accepted filters.
   * @param tokens - Command tokens beginning with `search`.
   * @returns Structured search invocation candidate.
   */
  #parseSearch(tokens: readonly string[]) {
    const query = tokens[1];

    if (query === undefined || query.startsWith("--")) {
      throw new CommandLineError(
        "expected search query as one non-empty argument",
        commandLineTokens.commands.search,
      );
    }

    const options = this.#options.parse(
      tokens.slice(2),
      [
        commandLineTokens.options.catalogue,
        commandLineTokens.options.collection,
        commandLineTokens.options.tag,
      ],
      commandLineTokens.commands.search,
    );

    return {
      command: commandLineTokens.commands.search,
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
    } as const;
  }

  /**
   * @description Parses one exact icon or collection lookup.
   * @param tokens - Command tokens beginning with `show`.
   * @returns Structured show invocation candidate.
   */
  #parseShow(tokens: readonly string[]) {
    const subject = tokens[1];
    const identity = tokens[2];

    if (
      subject !== commandLineTokens.subjects.icon &&
      subject !== commandLineTokens.subjects.collection
    ) {
      throw new CommandLineError(
        "expected show subject to be icon or collection",
        commandLineTokens.commands.show,
      );
    }

    if (identity === undefined || identity.startsWith("--")) {
      throw new CommandLineError(
        `expected one exact ${subject} identity`,
        commandLineTokens.commands.show,
      );
    }

    const options = this.#options.parse(
      tokens.slice(3),
      [commandLineTokens.options.catalogue],
      commandLineTokens.commands.show,
    );

    return {
      command: commandLineTokens.commands.show,
      subject,
      identity,
      ...(options.catalogue === undefined
        ? {}
        : { catalogue: options.catalogue }),
    } as const;
  }

  /**
   * @description Parses complete or command-specific help selection.
   * @param tokens - Command tokens beginning with `help`.
   * @returns Structured help invocation candidate.
   */
  #parseHelp(tokens: readonly string[]) {
    if (tokens.length > 2) {
      throw new CommandLineError(
        "help accepts at most one command name",
        commandLineTokens.commands.help,
      );
    }

    const commandName = tokens[1];

    if (
      commandName !== undefined &&
      commandName !== commandLineTokens.commands.export &&
      commandName !== commandLineTokens.commands.list &&
      commandName !== commandLineTokens.commands.search &&
      commandName !== commandLineTokens.commands.show
    ) {
      throw new CommandLineError(
        "help command must identify an accepted command",
        commandLineTokens.commands.help,
      );
    }

    return {
      command: commandLineTokens.commands.help,
      ...(commandName === undefined ? {} : { commandName }),
    } as const;
  }

  /**
   * @description Parses the argument-free version command.
   * @param tokens - Command tokens beginning with `version`.
   * @returns Structured version invocation candidate.
   */
  #parseVersion(tokens: readonly string[]) {
    if (tokens.length !== 1) {
      throw new CommandLineError(
        "version does not accept positional arguments or command options",
        commandLineTokens.commands.version,
      );
    }

    return { command: commandLineTokens.commands.version } as const;
  }

}
