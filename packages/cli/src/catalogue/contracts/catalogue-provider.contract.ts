import type { CatalogueSnapshot } from "./catalogue-snapshot.contract.js";

/**
 * @description Explicit host-supplied source of one identified catalogue snapshot.
 */
export interface CatalogueProvider {
  /**
   * @description Canonical ASCII lowercase kebab-case provider identity.
   */
  readonly identity: string;

  /**
   * @description Loads one immutable snapshot without relying on ambient discovery.
   * @returns Complete provider-owned catalogue state for the current execution.
   */
  load(): Promise<CatalogueSnapshot>;
}
