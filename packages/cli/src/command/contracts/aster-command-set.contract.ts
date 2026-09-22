import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";
import type { AsterCommandContext } from "./aster-command-context.contract.js";
import type { AsterCommandDescriptor } from "./aster-command-descriptor.contract.js";

/**
 * @description Public host-neutral Aster command composition for programmatic and shell hosts.
 */
export interface AsterCommandSet {
  /**
   * @description Stable command-set identity mounted by an external host.
   */
  readonly identity: "aster";

  /**
   * @description Canonically ordered immutable command help metadata.
   */
  readonly descriptors: readonly AsterCommandDescriptor[];

  /**
   * @description Validates and executes one invocation through explicit capabilities.
   * @param invocation - Structured command request supplied by the host.
   * @param context - Complete explicit execution capabilities.
   * @returns Structured immutable success or sanitised failure.
   */
  execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType>;
}
