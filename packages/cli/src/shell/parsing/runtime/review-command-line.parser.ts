import { asterCommandNames } from "../../../command/constants/aster-command-names.constant.js";
import type { ICommandLineCommandParser } from "../contracts/internal/command-line-command-parser.contract.js";
import type { TParsedCommandLine } from "../types/internal/parsed-command-line.type.js";
import { reviewSubjects } from "../../../review/constants/review-subjects.constant.js";
import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import { CommandLineError } from "./command-line.error.js";

/**
 * @description Adapts standalone review grammar without acquiring publication authority.
 */
export class ReviewCommandLineParser implements ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command = asterCommandNames.review;

  /**
   * @description Parses one exact icon or collection review request.
   * @param tokens - Command tokens beginning with `review`.
   * @param json - Whether machine-readable plan presentation was requested.
   * @returns Structured review invocation and optional shell-owned output root.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    const subject = tokens[1];
    const identity = tokens[2];

    if (
      subject !== reviewSubjects.icon
      && subject !== reviewSubjects.collection
    ) {
      throw new CommandLineError(
        "expected review subject to be icon or collection",
        this.command,
      );
    }

    if (identity === undefined || identity.startsWith("--")) {
      throw new CommandLineError(
        `expected one exact ${subject} identity`,
        this.command,
      );
    }

    let catalogue: string | undefined;
    let output: string | undefined;
    const remaining = tokens.slice(3);

    for (let index = 0; index < remaining.length; index += 2) {
      const option = remaining[index];
      const value = remaining[index + 1];

      if (
        option !== commandLineTokens.options.catalogue
        && option !== commandLineTokens.options.output
      ) {
        throw new CommandLineError(
          option?.startsWith("--") === true
            ? `unknown option ${JSON.stringify(option)}`
            : `unexpected positional argument ${JSON.stringify(option)}`,
          this.command,
        );
      }

      if (value === undefined || value.startsWith("--")) {
        throw new CommandLineError(
          `option ${option} requires a value`,
          this.command,
        );
      }

      if (option === commandLineTokens.options.catalogue) {
        if (catalogue !== undefined) {
          throw new CommandLineError(
            "option --catalogue cannot be repeated",
            this.command,
          );
        }
        catalogue = value;
      } else {
        if (output !== undefined) {
          throw new CommandLineError(
            "option --output cannot be repeated",
            this.command,
          );
        }
        output = value;
      }
    }

    if (json && output !== undefined) {
      throw new CommandLineError(
        "options --json and --output cannot be combined",
        this.command,
      );
    }

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        subject,
        identity,
        ...(catalogue === undefined ? {} : { catalogue }),
      }),
      json,
      ...(output === undefined ? {} : { output }),
    });
  }
}
