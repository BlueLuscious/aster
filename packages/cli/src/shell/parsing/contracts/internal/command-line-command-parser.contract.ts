import type { AsterCommandNameType } from "../../../../command/types/index.js";
import type { TParsedCommandLine } from "../../types/internal/parsed-command-line.type.js";

/**
 * @description Internal standalone argv adapter for one explicitly composed command family.
 */
export interface ICommandLineCommandParser {
  /**
   * @description Command identity owned by this parser.
   */
  readonly command: AsterCommandNameType;

  /**
   * @description Parses one command-local token sequence and presentation selection.
   * @param tokens - Command tokens beginning with the owned command identity.
   * @param json - Whether machine-readable presentation was requested.
   * @returns Accepted immutable standalone command description.
   */
  parse(tokens: readonly string[], json: boolean): TParsedCommandLine;
}
