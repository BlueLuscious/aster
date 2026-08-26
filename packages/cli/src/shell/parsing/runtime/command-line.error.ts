import type { AsterCommandNameType } from "../../../command/types/index.js";

/**
 * @description Deterministic usage error raised while adapting argv into a structured invocation.
 */
export class CommandLineError extends Error {
  /**
   * @description Recognised command identity when parsing progressed beyond command selection.
   */
  readonly command: AsterCommandNameType | undefined;

  /**
   * @description Creates one shell-owned usage error without retaining native failure evidence.
   * @param message - Stable human-readable explanation of invalid argv.
   * @param command - Recognised command identity when available.
   */
  constructor(message: string, command?: AsterCommandNameType) {
    super(message);
    this.name = "CommandLineError";
    this.command = command;
  }
}
