import { asterCommandNames } from "../../constants/aster-command-names.constant.js";
import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type {
  AsterCommandInvocationType,
  AsterCommandNameType,
} from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { isAsterCommandName } from "../../runtime/is-aster-command-name.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";

/**
 * @description Accepts the exact structured help invocation family.
 */
export class HelpInvocationNormaliser implements ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command = asterCommandNames.help;

  /**
   * @description Exact record acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical usage rejection constructor.
   */
  readonly #rejections = new InvocationRejectionFactory();

  /**
   * @description Accepts complete or command-specific help selection.
   * @param value - Candidate help invocation.
   * @returns Accepted immutable help invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(
      value,
      ["command", "commandName"],
      ["command"],
    );

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid("help invocation contains an unknown field");
    }

    let commandName: AsterCommandNameType | undefined;

    if (Object.hasOwn(record, "commandName")) {
      if (!isAsterCommandName(record.commandName)) {
        return this.#rejections.invalid(
          "expected help commandName to identify an accepted command",
        );
      }

      commandName = record.commandName;
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: this.command,
        ...(commandName === undefined ? {} : { commandName }),
      }),
    });
  }
}
