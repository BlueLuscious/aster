import type { CatalogueProvider } from "../../catalogue/contracts/index.js";
import type { AsterInstalledPackageVersion } from "./aster-installed-package-version.contract.js";

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

  /**
   * @description Optional explicit evidence for installed public package-version queries.
   */
  readonly packageVersions?: readonly AsterInstalledPackageVersion[];
}
