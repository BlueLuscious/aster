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
   * @description Parses project, executed-CLI, dependency, and location version requests.
   * @param tokens - Command tokens beginning with `version`.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Structured version invocation and presentation selection.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine {
    let scope: AsterVersionScopeType | undefined;
    let dependencies = false;
    let location = false;

    for (const token of tokens.slice(1)) {
      if (token === commandLineTokens.options.deps) {
        if (dependencies) {
          throw new CommandLineError("option --deps cannot be repeated", this.command);
        }
        dependencies = true;
        continue;
      }

      if (token === commandLineTokens.options.location) {
        if (location) {
          throw new CommandLineError("option --location cannot be repeated", this.command);
        }
        location = true;
        continue;
      }

      if (token === commandLineTokens.options.all || isAsterInstalledPackageSelector(token)) {
        if (scope !== undefined) {
          throw new CommandLineError("version accepts one package selector", this.command);
        }
        scope = token === commandLineTokens.options.all ? asterVersionScopes.all : token;
        continue;
      }

      throw new CommandLineError("version requires core, icons, svg, cli, --all, --deps, or --location", this.command);
    }

    if (location && scope !== undefined && scope !== "cli") {
      throw new CommandLineError("--location applies only to the executed CLI", this.command);
    }

    return Object.freeze({
      invocation: Object.freeze({
        command: this.command,
        ...(scope === undefined ? {} : { scope }),
        ...(dependencies ? { dependencies: true } : {}),
        ...(location ? { location: true } : {}),
      }),
      json,
    });
  }
}
