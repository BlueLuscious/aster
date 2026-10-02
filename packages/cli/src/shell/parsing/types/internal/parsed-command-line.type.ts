import type { TParsedCommandInvocation } from "./parsed-command-invocation.type.js";

/**
 * @description Accepted argv adaptation and its shell-owned presentation selection.
 */
export type TParsedCommandLine = Readonly<{
  /**
   * @description Host-neutral request delegated to command validation, including raw export tokens.
   */
  invocation: TParsedCommandInvocation;

  /**
   * @description Whether the shell must emit one machine-readable JSON document.
   */
  json: boolean;

  /**
   * @description Optional command output root retained outside the host-neutral invocation.
   */
  output?: string;

  /**
   * @description Whether the shell may replace an output carrying exact Aster ownership evidence.
   */
  replace?: boolean;
}>;
