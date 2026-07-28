/**
 * @description Stable render-neutral identity of one icon and optional variant.
 */
export interface IconIdentity {
  /**
   * @description Canonical ASCII lowercase kebab-case collection slug.
   */
  readonly collection: string;

  /**
   * @description Canonical ASCII lowercase kebab-case icon slug within the collection.
   */
  readonly name: string;

  /**
   * @description Optional canonical ASCII lowercase kebab-case variant slug.
   */
  readonly variant?: string;
}
