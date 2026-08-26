import type { AsterCommandInvocationType } from "../../../command/types/index.js";

/**
 * @description Accepted argv adaptation and its shell-owned presentation selection.
 */
export type TParsedCommandLine = Readonly<{
  /**
   * @description Structured host-neutral invocation delegated to the command set.
   */
  invocation: AsterCommandInvocationType;

  /**
   * @description Whether the shell must emit one machine-readable JSON document.
   */
  json: boolean;

  /**
   * @description Optional export output root retained outside the host-neutral invocation.
   */
  output?: string;
}>;
