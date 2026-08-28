import type { IconIdentity } from "@aster/core";
import type { iconImportFormats } from "../../../format/constants/icon-import-formats.constant.js";
import type { ICanonicalTextSource } from "./canonical-text-source.contract.js";

/**
 * @description Canonical exported SVG associated with one accepted logical icon identity.
 */
export interface ICanonicalSvgSource extends ICanonicalTextSource {
  /**
   * @description Discriminator for canonical SVG artwork.
   */
  readonly kind: typeof iconImportFormats.svg;

  /**
   * @description Identity established independently from SVG document contents.
   */
  readonly identity: IconIdentity;
}
