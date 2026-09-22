/**
 * @description Stable render-neutral identity of one icon and optional variant.
 */
export interface IconIdentity {
  /**
   * @description Optional canonical namespace owned independently of collection membership.
   */
  readonly namespace?: string;

  /**
   * @description Canonical ASCII lowercase kebab-case icon slug.
   */
  readonly name: string;

  /**
   * @description Optional canonical ASCII lowercase kebab-case variant slug.
   */
  readonly variant?: string;
}
