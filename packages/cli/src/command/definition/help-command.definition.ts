import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type {
  AsterCommandContext,
  AsterCommandDescriptor,
} from "../contracts/index.js";
import { CommandResultFactory } from "../runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Returns deterministic definition-owned help metadata without loading catalogues.
 */
export class HelpCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable help identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.help;

  /**
   * @description Complete canonically ordered descriptor sequence.
   */
  readonly #descriptors: readonly AsterCommandDescriptor[];

  /**
   * @description Structured command outcome constructor.
   */
  readonly #results = new CommandResultFactory();

  /**
   * @description Creates one help definition from complete immutable command metadata.
   * @param descriptors - Complete descriptor sequence selected independently of terminal output.
   */
  constructor(descriptors: readonly AsterCommandDescriptor[]) {
    this.#descriptors = Object.freeze([...descriptors].sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    ));
  }

  /**
   * @description Selects all descriptors or one exact command descriptor.
   * @param invocation - Canonical help invocation.
   * @param context - Accepted explicit capabilities unused by metadata selection.
   * @returns Immutable structured help outcome.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    void context;
    const commandName = invocation.command === asterCommandNames.help
      ? invocation.commandName
      : undefined;
    const descriptors = commandName === undefined
      ? this.#descriptors
      : this.#descriptors.filter((descriptor) => descriptor.name === commandName);

    return this.#results.success(asterCommandNames.help, Object.freeze({
      kind: asterCommandPayloadKinds.help,
      descriptors: Object.freeze([...descriptors]),
    }));
  }
}
