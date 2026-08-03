import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type {
  AsterCommandDescriptor,
  AsterCommandSet,
} from "../contracts/index.js";
import type {
  AsterCommandNameType,
  AsterCommandResultType,
} from "../types/index.js";
import { CommandContextNormaliser } from "./command-context.normaliser.js";
import { CommandDiagnosticFactory } from "./command-diagnostic.factory.js";
import { CommandInvocationNormaliser } from "./command-invocation.normaliser.js";
import { CommandResultFactory } from "./command-result.factory.js";

/**
 * @description Coordinates immutable invocation acceptance, capability acceptance, and dispatch.
 */
export class CommandKernel implements AsterCommandSet {
  /**
   * @description Stable host-neutral identity of this command composition.
   */
  readonly identity = "aster" as const;

  /**
   * @description Explicit immutable executable definitions indexed without a global registry.
   */
  readonly #definitions: ReadonlyMap<AsterCommandNameType, ICommandDefinition>;

  /**
   * @description Canonically ordered isolated help metadata exposed to hosts.
   */
  readonly #descriptors: readonly AsterCommandDescriptor[];

  /**
   * @description Structured invocation boundary normaliser.
   */
  readonly #invocations = new CommandInvocationNormaliser();

  /**
   * @description Explicit capability boundary normaliser.
   */
  readonly #contexts = new CommandContextNormaliser();

  /**
   * @description Immutable diagnostic constructor for dispatch failures.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Immutable structured command outcome constructor.
   */
  readonly #results = new CommandResultFactory();

  /**
   * @description Creates one isolated command composition from explicit definitions.
   * @param definitions - Closed executable definitions owned by the composition root.
   */
  constructor(definitions: readonly ICommandDefinition[]) {
    const entries: [AsterCommandNameType, ICommandDefinition][] = [];
    const descriptors: AsterCommandDescriptor[] = [];

    for (const definition of definitions) {
      const descriptor = this.#acceptDescriptor(definition.descriptor);

      if (entries.some(([name]) => name === descriptor.name)) {
        throw new TypeError(`Duplicate command definition ${descriptor.name}`);
      }

      entries.push([descriptor.name, definition]);
      descriptors.push(descriptor);
    }

    entries.sort(([left], [right]) => this.#compare(left, right));
    descriptors.sort((left, right) => this.#compare(left.name, right.name));

    this.#definitions = new Map(entries);
    this.#descriptors = Object.freeze(descriptors);
  }

  /**
   * @description Gets canonical immutable help metadata without executing any definition.
   * @returns Isolated canonically ordered command descriptors.
   */
  get descriptors(): readonly AsterCommandDescriptor[] {
    return this.#descriptors;
  }

  /**
   * @description Accepts and executes one request without acquiring host process effects.
   * @param invocation - Candidate structured command request.
   * @param context - Candidate complete explicit execution context.
   * @returns Immutable structured success or sanitised failure.
   */
  async execute(
    invocation: unknown,
    context: unknown,
  ): Promise<AsterCommandResultType> {
    const acceptedInvocation = this.#invocations.normalise(invocation);

    if (!acceptedInvocation.accepted) {
      return this.#results.failure(
        this.#identifyCommand(invocation),
        acceptedInvocation.diagnostic,
      );
    }

    const acceptedContext = this.#contexts.normalise(context);

    if (!acceptedContext.accepted) {
      return this.#results.failure(
        acceptedInvocation.value.command,
        acceptedContext.diagnostic,
      );
    }

    const definition = this.#definitions.get(acceptedInvocation.value.command);

    if (definition === undefined) {
      return this.#results.failure(
        acceptedInvocation.value.command,
        this.#diagnostics.create(
          commandDiagnosticSchema.categories.usage,
          commandDiagnosticSchema.codes.usage,
          `command ${acceptedInvocation.value.command} is not registered`,
        ),
      );
    }

    try {
      return await definition.execute(
        acceptedInvocation.value,
        acceptedContext.value,
      );
    } catch {
      return this.#results.failure(
        acceptedInvocation.value.command,
        this.#diagnostics.create(
          commandDiagnosticSchema.categories.executionFailure,
          commandDiagnosticSchema.codes.executionFailure,
          "command execution failed unexpectedly",
        ),
      );
    }
  }

  /**
   * @description Validates, isolates, and freezes one definition-owned descriptor.
   * @param descriptor - Candidate command metadata.
   * @returns Canonical immutable descriptor copy.
   */
  #acceptDescriptor(descriptor: AsterCommandDescriptor): AsterCommandDescriptor {
    if (
      typeof descriptor !== "object" ||
      descriptor === null ||
      typeof descriptor.name !== "string" ||
      !(Object.values(asterCommandNames) as readonly string[]).includes(
        descriptor.name,
      ) ||
      typeof descriptor.summary !== "string" ||
      descriptor.summary.length === 0 ||
      descriptor.summary.trim() !== descriptor.summary ||
      !Array.isArray(descriptor.usage) ||
      descriptor.usage.length === 0 ||
      !descriptor.usage.every(
        (usage) =>
          typeof usage === "string" &&
          usage.length > 0 &&
          usage.trim() === usage,
      )
    ) {
      throw new TypeError("Invalid command descriptor");
    }

    return Object.freeze({
      name: descriptor.name,
      summary: descriptor.summary,
      usage: Object.freeze([...descriptor.usage]),
    });
  }

  /**
   * @description Identifies a recognised command from malformed input when possible.
   * @param value - Candidate malformed invocation.
   * @returns Recognised command identity or no value.
   */
  #identifyCommand(value: unknown): AsterCommandNameType | undefined {
    if (typeof value !== "object" || value === null || !("command" in value)) {
      return undefined;
    }

    const command = value.command;
    return typeof command === "string" &&
      (Object.values(asterCommandNames) as readonly string[]).includes(command)
      ? (command as AsterCommandNameType)
      : undefined;
  }

  /**
   * @description Compares canonical ASCII values without locale-sensitive behaviour.
   * @param left - Left canonical value.
   * @param right - Right canonical value.
   * @returns Negative, zero, or positive lexical relation.
   */
  #compare(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
