import { CatalogueSearchQuery } from "../../catalogue/runtime/catalogue-search.query.js";
import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Owns search help metadata and delegates accepted matching to the catalogue query.
 */
export class SearchCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable search identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.search;

  /**
   * @description Deterministic mixed catalogue search query.
   */
  readonly #query: CatalogueSearchQuery;

  /**
   * @description Creates one search definition from its explicit query dependency.
   * @param query - Deterministic mixed catalogue search query.
   */
  constructor(query: CatalogueSearchQuery) {
    this.#query = query;
  }

  /**
   * @description Executes one accepted search invocation.
   * @param invocation - Canonical invocation matching the search identity.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Immutable structured search outcome.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    if (invocation.command !== asterCommandNames.search) {
      throw new TypeError("Invalid search command invocation");
    }

    return this.#query.execute(invocation, context);
  }
}
