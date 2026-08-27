import { asterCommandNames } from "../../constants/aster-command-names.constant.js";
import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type { AsterCommandInvocationType } from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";

/**
 * @description Accepts the exact structured version invocation family.
 */
export class VersionInvocationNormaliser implements ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command = asterCommandNames.version;

  /**
   * @description Exact record acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical usage rejection constructor.
   */
  readonly #rejections = new InvocationRejectionFactory();

  /**
   * @description Accepts the argument-free version invocation.
   * @param value - Candidate version invocation.
   * @returns Accepted immutable version invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, ["command"], ["command"]);

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid(
        "version invocation does not accept additional fields",
      );
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({ command: this.command }),
    });
  }
}
