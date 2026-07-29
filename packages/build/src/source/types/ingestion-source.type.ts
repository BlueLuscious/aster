import type {
  CanonicalSvgSource,
  CollectionMetadataSource,
  IconMetadataSource,
} from "../contracts/index.js";

/**
 * @description Closed source descriptor union accepted by the SVG ingestion pipeline.
 */
export type IngestionSourceType =
  | CanonicalSvgSource
  | CollectionMetadataSource
  | IconMetadataSource;
