import type { CatalogueProvider } from "../../catalogue/contracts/index.js";

/**
 * @description Complete explicit host capabilities supplied to one command execution.
 */
export interface AsterCommandContext {
  /**
   * @description Immutable provider sequence available to catalogue commands.
   */
  readonly catalogues: readonly CatalogueProvider[];

  /**
   * @description Product name exposed by deterministic version metadata.
   */
  readonly productName: string;

  /**
   * @description Product version exposed by deterministic version metadata.
   */
  readonly productVersion: string;
}
