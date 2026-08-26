import type { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import type { AsterCommandInvocationType } from "../../command/types/index.js";
import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { TParsedExportCommandLine } from "../types/internal/parsed-export-command-line.type.js";
import { CommandLineError } from "./command-line.error.js";
import { ExportCommandLineOptionParser } from "./export-command-line-option.parser.js";

/**
 * @description Adapts the standalone export grammar into a host-neutral invocation.
 */
export class ExportCommandLineParser {
  /**
   * @description Closed parser for export-specific invocation and shell options.
   */
  readonly #options = new ExportCommandLineOptionParser();

  /**
   * @description Parses one exact icon or collection export without acquiring output authority.
   * @param tokens - Command tokens beginning with `export`.
   * @param json - Whether machine-readable plan presentation was requested.
   * @returns Structured export invocation and optional shell-owned output root.
   */
  parse(
    tokens: readonly string[],
    json: boolean,
  ): TParsedExportCommandLine {
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

    const parsed = this.#options.parse(tokens.slice(3), subject);

    if (json && parsed.output !== undefined) {
      throw new CommandLineError(
        "options --json and --output cannot be combined",
        commandLineTokens.commands.export,
      );
    }

    if (
      subject === commandLineTokens.subjects.collection
      && !json
      && parsed.output === undefined
    ) {
      throw new CommandLineError(
        "collection export requires --json or --output",
        commandLineTokens.commands.export,
      );
    }

    const options = Object.freeze({
      ...(parsed.size === undefined ? {} : { size: parsed.size }),
      ...(parsed.colour === undefined ? {} : { colour: parsed.colour }),
      ...(parsed.fill === undefined ? {} : { fill: parsed.fill }),
      ...(parsed.stroke === undefined ? {} : { stroke: parsed.stroke }),
      ...(parsed.strokeWidth === undefined
        ? {}
        : { strokeWidth: parsed.strokeWidth }),
      ...(parsed.direction === undefined
        ? {}
        : { direction: parsed.direction }),
      ...(parsed.label === undefined ? {} : { label: parsed.label }),
      ...(parsed.title === undefined ? {} : { title: parsed.title }),
    });
    const invocation: Extract<
      AsterCommandInvocationType,
      { command: typeof asterCommandNames.export }
    > = {
      command: commandLineTokens.commands.export,
      subject,
      identity,
      ...(parsed.catalogue === undefined
        ? {}
        : { catalogue: parsed.catalogue }),
      ...(Object.keys(options).length === 0 ? {} : { options }),
    };

    return Object.freeze({
      invocation: Object.freeze(invocation),
      ...(parsed.output === undefined ? {} : { output: parsed.output }),
    });
  }
}
