import { CatalogueListQuery } from "../catalogue/runtime/catalogue-list.query.js";
import { CatalogueLoader } from "../catalogue/runtime/catalogue.loader.js";
import { CatalogueSearchQuery } from "../catalogue/runtime/catalogue-search.query.js";
import { CatalogueShowQuery } from "../catalogue/runtime/catalogue-show.query.js";
import { asterCommandDescriptors } from "../command/constants/aster-command-descriptors.constant.js";
import { ExportCommandDefinition } from "../command/definition/export-command.definition.js";
import { HelpCommandDefinition } from "../command/definition/help-command.definition.js";
import { ListCommandDefinition } from "../command/definition/list-command.definition.js";
import { SearchCommandDefinition } from "../command/definition/search-command.definition.js";
import { ShowCommandDefinition } from "../command/definition/show-command.definition.js";
import { VersionCommandDefinition } from "../command/definition/version-command.definition.js";
import { CatalogueExportSelector } from "../export/runtime/catalogue-export.selector.js";
import { ExportPlanQuery } from "../export/runtime/export-plan.query.js";
import type {
  AsterCommandContext,
  AsterCommandSet,
} from "../command/contracts/index.js";
import { CommandKernel } from "../command/runtime/command.kernel.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../command/types/index.js";

/**
 * @description Shared stateless provider loader owned by the command composition root.
 */
const catalogueLoader = new CatalogueLoader();

/**
 * @description Complete immutable descriptor sequence supplied to deterministic help.
 */
const commandDescriptors = Object.freeze(Object.values(asterCommandDescriptors));

/**
 * @description Explicit immutable command kernel used by every programmatic host.
 */
const commandKernel = new CommandKernel([
  new ExportCommandDefinition(
    new ExportPlanQuery(new CatalogueExportSelector(catalogueLoader)),
  ),
  new ListCommandDefinition(new CatalogueListQuery(catalogueLoader)),
  new SearchCommandDefinition(new CatalogueSearchQuery(catalogueLoader)),
  new ShowCommandDefinition(new CatalogueShowQuery(catalogueLoader)),
  new HelpCommandDefinition(commandDescriptors),
  new VersionCommandDefinition(),
]);

/**
 * @description Immutable public host-neutral composition for executing initial Aster commands.
 */
export const AsterCommands: AsterCommandSet = Object.freeze({
  identity: commandKernel.identity,
  descriptors: commandKernel.descriptors,

  /**
   * @description Validates and executes one structured invocation through explicit capabilities.
   * @param invocation - Structured command request supplied by the host.
   * @param context - Complete explicit execution capabilities.
   * @returns Structured immutable success or sanitised failure.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    return commandKernel.execute(invocation, context);
  },
});
