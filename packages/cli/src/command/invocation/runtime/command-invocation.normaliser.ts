import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type { AsterCommandInvocationType } from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";

/**
 * @description Dispatches structured invocation acceptance to explicit command-owned normalisers.
 */
export class CommandInvocationNormaliser {
  /**
   * @description Explicit immutable normalisers indexed by their unique command identity.
   */
  readonly #normalisers: ReadonlyMap<string, ICommandInvocationNormaliser>;

  /**
   * @description Safe command-discriminator inspection authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical usage rejection constructor.
   */
  readonly #rejections = new InvocationRejectionFactory();

  /**
   * @description Creates one dispatcher from explicitly supplied command-family normalisers.
   * @param normalisers - Complete command normalisers owned by the composition root.
   */
  constructor(normalisers: readonly ICommandInvocationNormaliser[]) {
    const entries = normalisers.map((normaliser) => [
      normaliser.command,
      normaliser,
    ] as const);

    if (new Set(entries.map(([command]) => command)).size !== entries.length) {
      throw new TypeError("Duplicate command invocation normaliser");
    }

    this.#normalisers = new Map(entries);
  }

  /**
   * @description Accepts one candidate through its explicitly registered command grammar.
   * @param value - Candidate structured invocation.
   * @returns Canonical immutable invocation or structured usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const commandMember = this.#data.ownDataMember(value, "command");

    if (commandMember === undefined || typeof commandMember.value !== "string") {
      return this.#rejections.invalid(
        "expected invocation.command to identify a command",
      );
    }

    const normaliser = this.#normalisers.get(commandMember.value);

    return normaliser === undefined
      ? this.#rejections.invalid(
          `unknown command ${JSON.stringify(commandMember.value)}`,
        )
      : normaliser.normalise(value);
  }
}
