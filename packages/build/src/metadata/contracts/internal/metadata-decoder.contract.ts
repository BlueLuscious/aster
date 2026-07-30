import type {
  CollectionMetadataSource,
  IconMetadataSource,
} from "../../../source/contracts/index.js";
import type { DiagnosticResultType } from "../../../diagnostic/types/index.js";
import type { IIconMetadataValue } from "../../../normalisation/contracts/internal/icon-metadata-value.contract.js";
import type { IDecodedCollectionMetadata } from "./decoded-collection-metadata.contract.js";

/**
 * @description Internal source-aware boundary for strict version-one JSON metadata decoding.
 */
export interface IMetadataDecoder {
  /**
   * @description Decodes one strict collection metadata source.
   * @param source - Canonical textual collection metadata.
   * @returns Accepted immutable collection values or blocking metadata diagnostics.
   */
  decodeCollection(
    source: CollectionMetadataSource,
  ): DiagnosticResultType<IDecodedCollectionMetadata>;

  /**
   * @description Decodes one strict icon metadata source.
   * @param source - Canonical textual icon metadata.
   * @returns Accepted immutable icon values or blocking metadata diagnostics.
   */
  decodeIcon(
    source: IconMetadataSource,
  ): DiagnosticResultType<IIconMetadataValue>;
}
