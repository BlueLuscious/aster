/**
 * @description Stable render-neutral identity of one collection.
 */
export interface CollectionIdentity {
  /**
   * @description Optional canonical namespace independent of collection membership.
   */
  readonly namespace?: string;

  /**
   * @description Canonical ASCII lowercase kebab-case collection slug.
   */
  readonly name: string;
}
