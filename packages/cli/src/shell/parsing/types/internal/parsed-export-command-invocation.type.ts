import type { asterCommandNames } from "../../../../command/constants/aster-command-names.constant.js";
import type { AsterExportSubjectType } from "../../../../export/types/index.js";
import type { TParsedExportCommandOptions } from "./parsed-export-command-options.type.js";

/**
 * @description Shell export request whose render tokens await command validation.
 */
export type TParsedExportCommandInvocation = Readonly<{
  /**
   * @description Export-command discriminator.
   */
  command: typeof asterCommandNames.export;

  /**
   * @description Exact icon or collection export subject accepted by the parser.
   */
  subject: AsterExportSubjectType;

  /**
   * @description Candidate portable identity delegated to the command boundary.
   */
  identity: string;

  /**
   * @description Optional provider filter delegated to the command boundary.
   */
  catalogue?: string;

  /**
   * @description Render tokens without shell-owned output or provider selection.
   */
  options?: Readonly<Omit<TParsedExportCommandOptions, "catalogue" | "output">>;
}>;
