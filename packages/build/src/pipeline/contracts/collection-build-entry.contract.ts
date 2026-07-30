import type {
  CanonicalSvgSource,
  IconMetadataSource,
} from "../../source/contracts/index.js";

/**
 * @description One independently acquired SVG and metadata source pair.
 */
export interface CollectionBuildEntry {
  /**
   * @description Canonical SVG artwork source.
   */
  readonly svg: CanonicalSvgSource;

  /**
   * @description Canonical icon metadata source paired by host-established identity.
   */
  readonly metadata: IconMetadataSource;
}
