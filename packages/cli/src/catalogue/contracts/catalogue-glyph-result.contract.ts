import type { IconGlyphIdentity } from "@luscious-garden/aster-core";
import type { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";
import type { CatalogueIconResult } from "./catalogue-icon-result.contract.js";

/**
 * @description Immutable metadata-only family derived from one provider's concrete icon records.
 * @remarks Glyphs retain provider provenance and never select a default or contain geometry.
 */
export interface CatalogueGlyphResult {
  /** @description Discriminator for a glyph result. */
  readonly kind: typeof catalogueResultKinds.glyph;

  /** @description Provider supplying every treatment in this family. */
  readonly catalogue: string;

  /** @description Complete namespace/name identity without a treatment. */
  readonly identity: IconGlyphIdentity;

  /** @description Canonically ordered concrete results retaining their metadata and memberships. */
  readonly variants: readonly CatalogueIconResult[];
}
