import { commandLineTokens } from "../constants/command-line-tokens.constant.js";
import { asterVersionScopes } from "../../../command/constants/aster-version-scopes.constant.js";
import { isAsterInstalledPackageSelector } from "../../../command/runtime/is-aster-installed-package-selector.js";
import type { AsterVersionScopeType } from "../../../command/types/aster-version-scope.type.js";
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
   * @description Parses plain, named, or complete installed version requests.
   * @param tokens - Command tokens beginning with `version`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured version invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    if (tokens.length > 2) {
      throw new CommandLineError(
        "version accepts only one package selector or --all",
        this.command,
      );
    }

    const selector = tokens[1];

    let scope: AsterVersionScopeType | undefined;

    if (selector === commandLineTokens.options.all) {
      scope = asterVersionScopes.all;
    } else if (selector !== undefined) {
      if (!isAsterInstalledPackageSelector(selector)) {
        throw new CommandLineError(
          "version requires core, icons, svg, cli, or --all",
          this.command,
        );
      }

      scope = selector;
    }

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        ...(scope === undefined ? {} : { scope }),
      }),
      json,
    });
  }
}
