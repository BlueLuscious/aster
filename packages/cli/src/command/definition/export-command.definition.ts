import { ExportPlanQuery } from "../../export/runtime/export-plan.query.js";
import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Owns export help metadata and delegates complete headless artefact planning.
 */
export class ExportCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable export identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.export;

  /**
   * @description Deterministic host-neutral export planner.
   */
  readonly #query: ExportPlanQuery;

  /**
   * @description Creates one export definition from its explicit planning dependency.
   * @param query - Deterministic host-neutral export planner.
   */
  constructor(query: ExportPlanQuery) {
    this.#query = query;
  }

  /**
   * @description Executes one accepted icon or collection export invocation.
   * @param invocation - Canonical invocation matching the export identity.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Immutable structured export plan or deterministic failure.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    if (invocation.command !== asterCommandNames.export) {
      throw new TypeError("Invalid export command invocation");
    }

    return this.#query.execute(invocation, context);
  }
}

