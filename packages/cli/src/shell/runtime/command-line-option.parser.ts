import type { AsterCommandNameType } from "../../command/types/index.js";
import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import type { TParsedCommandOptions } from "../types/internal/parsed-command-options.type.js";
import { CommandLineError } from "./command-line.error.js";

/**
 * @description Parses one closed command-specific sequence of standalone-shell options.
 */
export class CommandLineOptionParser {
  /**
   * @description Parses singleton filters and repeated tags without interpreting their domains.
   * @param tokens - Option tokens following required positional arguments.
   * @param accepted - Options accepted by the current command form.
   * @param command - Recognised command owning the options.
   * @returns Accumulated singleton filters and repeated tags.
   */
  parse(
    tokens: readonly string[],
    accepted: readonly string[],
    command: AsterCommandNameType,
  ): TParsedCommandOptions {
    const options: TParsedCommandOptions = { tags: [] };

    for (let index = 0; index < tokens.length; index += 1) {
      const option = tokens[index];

      if (option === undefined || !accepted.includes(option)) {
        const description = option?.startsWith("--") === true
          ? `unknown option ${JSON.stringify(option)}`
          : `unexpected positional argument ${JSON.stringify(option)}`;
        throw new CommandLineError(description, command);
      }

      const value = tokens[index + 1];

      if (value === undefined || value.startsWith("--")) {
        throw new CommandLineError(`option ${option} requires a value`, command);
      }

      index += 1;

      if (option === commandLineTokens.options.tag) {
        options.tags.push(value);
        continue;
      }

      if (option === commandLineTokens.options.catalogue) {
        if (options.catalogue !== undefined) {
          throw new CommandLineError(
            "option --catalogue cannot be repeated",
            command,
          );
        }

        options.catalogue = value;
        continue;
      }

      if (options.collection !== undefined) {
        throw new CommandLineError(
          "option --collection cannot be repeated",
          command,
        );
      }

      options.collection = value;
    }

    return options;
  }
}
