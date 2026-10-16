/**
 * @description Render-neutral identity shared by the explicit treatments of one glyph.
 */
export interface IconGlyphIdentity {
  /**
   * @description Optional canonical namespace independent of collection membership.
   */
  readonly namespace?: string;

  /**
   * @description Canonical ASCII lowercase kebab-case glyph slug.
   */
  readonly name: string;
}
