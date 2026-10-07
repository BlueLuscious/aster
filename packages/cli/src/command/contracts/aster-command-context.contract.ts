import type { CatalogueProvider } from "../../catalogue/contracts/index.js";
import type { AsterPackageVersionEvidence } from "./aster-package-version-evidence.contract.js";
import type { AsterPackageDependencyEvidence } from "./aster-package-dependency-evidence.contract.js";
import type { AsterCliLocationEvidence } from "./aster-cli-location-evidence.contract.js";

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
   * @description Optional source-tagged evidence for installed public package-version queries.
   */
  readonly packageVersions?: AsterPackageVersionEvidence;

  /** @description Optional source-tagged direct dependency groups for version queries. */
  readonly packageDependencies?: AsterPackageDependencyEvidence;

  /** @description Optional host evidence for an explicitly requested CLI location. */
  readonly cliLocation?: AsterCliLocationEvidence;
}
