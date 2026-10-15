import type { IconGlyphIdentity } from "./icon-glyph-identity.contract.js";

/**
 * @description Stable render-neutral identity of one explicitly treated glyph definition.
 */
export interface IconIdentity extends IconGlyphIdentity {
  /**
   * @description Required canonical ASCII lowercase kebab-case treatment slug.
   */
  readonly variant: string;
}
