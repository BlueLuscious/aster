import type { asterCommandNames } from "../../../command/constants/aster-command-names.constant.js";
import type { AsterCommandInvocationType } from "../../../command/types/index.js";

/**
 * @description Accepted export invocation and its optional shell-owned output destination.
 */
export type TParsedExportCommandLine = Readonly<{
  /**
   * @description Structured host-neutral export invocation.
   */
  invocation: Extract<
    AsterCommandInvocationType,
    { command: typeof asterCommandNames.export }
  >;

  /**
   * @description Explicit output root retained only by the standalone shell.
   */
  output?: string;
}>;
