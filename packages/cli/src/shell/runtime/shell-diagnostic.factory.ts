import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { AsterCommandResultType } from "../../command/types/index.js";
import { CommandLineError } from "./command-line.error.js";

/**
 * @description Adapts shell-owned parsing and execution faults into command-result diagnostics.
 */
export class ShellDiagnosticFactory {
  /**
   * @description Canonical immutable diagnostic constructor shared with the command kernel.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Converts one deterministic argv error into a structured usage failure.
   * @param error - Shell-owned command-line parsing error.
   * @returns Immutable failed result suitable for either presenter.
   */
  usage(error: CommandLineError): AsterCommandResultType {
    return Object.freeze({
      ok: false,
      ...(error.command === undefined ? {} : { command: error.command }),
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.usage,
        error.message,
      ),
    });
  }

  /**
   * @description Creates one sanitised result for an unexpected standalone-shell fault.
   * @returns Immutable execution failure without native exception evidence.
   */
  unexpected(): AsterCommandResultType {
    return Object.freeze({
      ok: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.executionFailure,
        commandDiagnosticSchema.codes.executionFailure,
        "standalone shell failed unexpectedly",
      ),
    });
  }
}
