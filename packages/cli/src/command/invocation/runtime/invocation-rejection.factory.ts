import { commandDiagnosticSchema } from "../../constants/command-diagnostic-schema.constant.js";
import { asterCommandSubjects } from "../../constants/aster-command-subjects.constant.js";
import { CommandDiagnosticFactory } from "../../runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import type { AsterCommandShowSubjectType } from "../../types/aster-command-show-subject.type.js";

/**
 * @description Constructs consistent structured usage rejections for invocation normalisers.
 */
export class InvocationRejectionFactory {
  /**
   * @description Immutable command diagnostic constructor.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Explains the textual identity required by a subject without choosing a treatment.
   * @typeParam Value - Invocation family rejected before acceptance.
   * @param subject - Accepted subject whose identity was malformed.
   * @returns Shared usage rejection including the required identity grammar.
   */
  invalidIdentity<Value>(subject: AsterCommandShowSubjectType): TAcceptanceResult<Value> {
    const grammar = subject === asterCommandSubjects.show.icon ? "[namespace/]name@variant" : "[namespace/]name";
    const hint = subject === asterCommandSubjects.show.icon ? "; use show glyph <identity> to inspect available treatments" : "";
    return this.invalid(`expected a canonical ${subject} identity ${grammar}${hint}`);
  }

  /**
   * @description Creates one immutable invalid-invocation result.
   * @param message - Stable explanation of the malformed invocation.
   * @returns Structured rejected acceptance result.
   * @typeParam Value - Invocation family rejected before acceptance.
   */
  invalid<Value>(message: string): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create({
        category: commandDiagnosticSchema.categories.usage,
        code: commandDiagnosticSchema.codes.usage,
        message,
      }),
    });
  }
}
