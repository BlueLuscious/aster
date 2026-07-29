/**
 * @description Canonical logical identity claimed by source acquisition before Core construction.
 */
export interface SourceIdentity {
  /**
   * @description Canonical ASCII lowercase kebab-case collection slug.
   */
  readonly collection: string;

  /**
   * @description Canonical ASCII lowercase kebab-case icon slug.
   */
  readonly name: string;

  /**
   * @description Optional canonical ASCII lowercase kebab-case variant slug.
   */
  readonly variant?: string;
}
