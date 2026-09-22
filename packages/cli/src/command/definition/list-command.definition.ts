import { CatalogueListQuery } from "../../catalogue/runtime/catalogue-list.query.js";
import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Owns list help metadata and delegates accepted listing to the catalogue query.
 */
export class ListCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable list identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.list;

  /**
   * @description Deterministic catalogue list query.
   */
  readonly #query: CatalogueListQuery;

  /**
   * @description Creates one list definition from its explicit query dependency.
   * @param query - Deterministic catalogue list query.
   */
  constructor(query: CatalogueListQuery) {
    this.#query = query;
  }

  /**
   * @description Executes one accepted list invocation.
   * @param invocation - Canonical invocation matching the list identity.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Immutable structured list outcome.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    if (invocation.command !== asterCommandNames.list) {
      throw new TypeError("Invalid list command invocation");
    }

    return this.#query.execute(invocation, context);
  }
}
