import { CatalogueShowQuery } from "../../catalogue/runtime/catalogue-show.query.js";
import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Owns show help metadata and delegates exact lookup to the catalogue query.
 */
export class ShowCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable show identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.show;

  /**
   * @description Deterministic exact catalogue lookup query.
   */
  readonly #query: CatalogueShowQuery;

  /**
   * @description Creates one show definition from its explicit query dependency.
   * @param query - Deterministic exact catalogue lookup query.
   */
  constructor(query: CatalogueShowQuery) {
    this.#query = query;
  }

  /**
   * @description Executes one accepted exact lookup invocation.
   * @param invocation - Canonical invocation matching the show identity.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Immutable structured exact lookup outcome.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    if (invocation.command !== asterCommandNames.show) {
      throw new TypeError("Invalid show command invocation");
    }

    return this.#query.execute(invocation, context);
  }
}
