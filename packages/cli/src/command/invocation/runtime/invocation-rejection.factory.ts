import { commandDiagnosticSchema } from "../../constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";

/**
 * @description Constructs consistent structured usage rejections for invocation normalisers.
 */
export class InvocationRejectionFactory {
  /**
   * @description Immutable command diagnostic constructor.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Creates one immutable invalid-invocation result.
   * @param message - Stable explanation of the malformed invocation.
   * @returns Structured rejected acceptance result.
   * @typeParam Value - Invocation family rejected before acceptance.
   */
  invalid<Value>(message: string): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.usage,
        message,
      ),
    });
  }
}
