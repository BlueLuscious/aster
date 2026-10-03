import type { asterCommandNames } from "../../../../command/constants/aster-command-names.constant.js";
import type { AsterCommandInvocationType } from "../../../../command/types/index.js";
import type { TParsedExportCommandInvocation } from "./parsed-export-command-invocation.type.js";

/**
 * @description Shell request with raw export tokens kept distinct from validated command options.
 */
export type TParsedCommandInvocation =
  | Exclude<
      AsterCommandInvocationType,
      {
        /** @description Export-command discriminator excluded from validated requests. */
        command: typeof asterCommandNames.export;
      }
    >
  | TParsedExportCommandInvocation;
