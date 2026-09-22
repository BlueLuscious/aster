import type {
  AsterCommandDiagnosticType,
  AsterCommandNameType,
  AsterCommandPayloadType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Constructs immutable structured command successes and failures.
 */
export class CommandResultFactory {
  /**
   * @description Creates one immutable successful command outcome.
   * @param command - Command that produced the payload.
   * @param payload - Immutable command-specific payload.
   * @returns Structured successful result.
   * @typeParam Payload - Concrete closed success payload family.
   */
  success<Payload extends AsterCommandPayloadType>(
    command: AsterCommandNameType,
    payload: Payload,
  ): AsterCommandResultType<Payload> {
    return Object.freeze({ ok: true, command, payload });
  }

  /**
   * @description Creates one immutable failed command outcome.
   * @param command - Identified requested command when available.
   * @param diagnostic - Stable structured failure evidence.
   * @returns Structured failed result.
   */
  failure(
    command: AsterCommandNameType | undefined,
    diagnostic: AsterCommandDiagnosticType,
  ): AsterCommandResultType {
    return Object.freeze({
      ok: false,
      ...(command === undefined ? {} : { command }),
      diagnostic,
    });
  }
}
