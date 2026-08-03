import type { AsterCommandContext } from "../aster-command-context.contract.js";
import type { AsterCommandDescriptor } from "../aster-command-descriptor.contract.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../types/index.js";

/**
 * @description Internal executable command definition composed explicitly by the command kernel.
 */
export interface ICommandDefinition {
  /**
   * @description Immutable identity and help metadata owned by this definition.
   */
  readonly descriptor: AsterCommandDescriptor;

  /**
   * @description Executes one accepted invocation through accepted explicit capabilities.
   * @param invocation - Canonical invocation matching the definition identity.
   * @param context - Canonical explicit execution context.
   * @returns Immutable structured command outcome.
   */
  execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType>;
}
