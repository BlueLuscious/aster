import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import { CommandResultFactory } from "../runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Returns explicit host-supplied product metadata without loading catalogues.
 */
export class VersionCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable version identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.version;

  /**
   * @description Structured command outcome constructor.
   */
  readonly #results = new CommandResultFactory();

  /**
   * @description Returns explicit accepted product name and version.
   * @param invocation - Canonical version invocation unused after dispatch acceptance.
   * @param context - Accepted explicit product metadata.
   * @returns Immutable structured version outcome.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    void invocation;
    return this.#results.success(asterCommandNames.version, Object.freeze({
      kind: asterCommandPayloadKinds.version,
      productName: context.productName,
      productVersion: context.productVersion,
    }));
  }
}
