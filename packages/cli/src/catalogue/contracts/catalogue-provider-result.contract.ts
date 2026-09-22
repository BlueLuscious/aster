/**
 * @description Immutable discovery result describing one loaded catalogue provider.
 */
export interface CatalogueProviderResult {
  /**
   * @description Canonical provider identity.
   */
  readonly identity: string;

  /**
   * @description Number of unique icon records supplied by the provider.
   */
  readonly iconCount: number;

  /**
   * @description Number of unique collection records supplied by the provider.
   */
  readonly collectionCount: number;
}
