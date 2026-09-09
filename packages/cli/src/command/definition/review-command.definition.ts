import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";
import { ReviewPlanQuery } from "../../review/runtime/review-plan.query.js";

/**
 * @description Owns review help metadata and delegates complete headless document planning.
 */
export class ReviewCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable review identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.review;

  /**
   * @description Deterministic host-neutral review planner.
   */
  readonly #query: ReviewPlanQuery;

  /**
   * @description Creates one review definition from its explicit planning dependency.
   * @param query - Deterministic host-neutral review planner.
   */
  constructor(query: ReviewPlanQuery) {
    this.#query = query;
  }

  /**
   * @description Executes one accepted icon or collection review invocation.
   * @param invocation - Canonical invocation matching the review identity.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Immutable structured review plan or deterministic failure.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    if (invocation.command !== asterCommandNames.review) {
      throw new TypeError("Invalid review command invocation");
    }

    return this.#query.execute(invocation, context);
  }
}
