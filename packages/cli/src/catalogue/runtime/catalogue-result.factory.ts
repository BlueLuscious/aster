import { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import type {
  CatalogueCollectionResult,
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
  CatalogueIconResult,
  CatalogueGlyphResult,
  CatalogueProviderResult,
} from "../contracts/index.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";

/**
 * @description Projects accepted provider records into immutable public discovery results.
 */
export class CatalogueResultFactory {
  /** @description Canonical textual keys used to derive glyph families without merging providers. */
  readonly #identities = new CatalogueIdentityFormatter();

  /** @description Locale-independent ordering for glyph keys. */
  readonly #strings = new AsciiStringComparator();

  /**
   * @description Derives exact glyph families from one provider's canonically ordered icon records.
   * @param catalogue - Accepted metadata whose concrete identities are unique and ordered.
   * @returns Frozen glyphs ordered by namespace/name, with full ordered concrete results.
   */
  glyphs(catalogue: TAcceptedCatalogueDiscovery): readonly CatalogueGlyphResult[] {
    const groups = new Map<string, CatalogueDiscoveryIconRecord[]>();
    for (const record of catalogue.icons) {
      const key = this.#identities.glyph(record.identity);
      const group = groups.get(key);
      if (group === undefined) {
        groups.set(key, [record]);
      } else {
        group.push(record);
      }
    }

    return Object.freeze([...groups]
      .sort(([left], [right]) => this.#strings.compare(left, right))
      .map(([, records]) => {
        const first = records[0];
        if (first === undefined) {
          throw new TypeError("Missing derived glyph treatment");
        }

        return Object.freeze({
          kind: catalogueResultKinds.glyph,
          catalogue: catalogue.identity,
          identity: Object.freeze({
            ...(first.identity.namespace === undefined ? {} : { namespace: first.identity.namespace }),
            name: first.identity.name,
          }),
          variants: Object.freeze(records.map((record) => this.icon(catalogue.identity, record))),
        });
      }));
  }

  /**
   * @description Creates one provider summary from an accepted catalogue.
   * @param catalogue - Accepted provider catalogue.
   * @returns Immutable provider identity and record counts.
   */
  provider(catalogue: TAcceptedCatalogueDiscovery): CatalogueProviderResult {
    return Object.freeze({
      identity: catalogue.identity,
      iconCount: catalogue.icons.length,
      collectionCount: catalogue.collections.length,
    });
  }

  /**
   * @description Creates one icon result from an accepted provider record.
   * @param catalogue - Supplying provider identity.
   * @param record - Accepted icon record.
   * @returns Immutable icon identity, metadata, and membership evidence.
   */
  icon(
    catalogue: string,
    record: CatalogueDiscoveryIconRecord,
  ): CatalogueIconResult {
    return Object.freeze({
      kind: catalogueResultKinds.icon,
      catalogue,
      identity: record.identity,
      metadata: record.metadata,
      memberships: Object.freeze([...record.memberships]),
    });
  }

  /**
   * @description Creates one collection result from accepted discovery metadata.
   * @param catalogue - Supplying provider identity.
   * @param record - Accepted collection discovery record.
   * @returns Immutable collection identity, metadata, and member evidence.
   */
  collection(
    catalogue: string,
    record: CatalogueDiscoveryCollectionRecord,
  ): CatalogueCollectionResult {
    return Object.freeze({
      kind: catalogueResultKinds.collection,
      catalogue,
      identity: record.identity,
      metadata: record.metadata,
      icons: Object.freeze([...record.icons]),
    });
  }
}
