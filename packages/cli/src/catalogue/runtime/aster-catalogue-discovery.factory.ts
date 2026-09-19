import type {
  CatalogueDiscovery,
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
} from "../contracts/index.js";
import type { TAsterCollectionManifestEntry } from "../types/internal/aster-collection-manifest-entry.type.js";
import type { TAsterIconManifestEntry } from "../types/internal/aster-icon-manifest-entry.type.js";

/**
 * @description Adapts canonical Icons manifest entries into provider-neutral discovery records.
 */
export class AsterCatalogueDiscoveryFactory {
  /**
   * @description Creates metadata-only discovery with memberships derived from manifest members.
   * @param icons - Complete canonical icon manifest.
   * @param collections - Complete canonical collection manifest.
   * @returns Immutable provider-neutral discovery records.
   */
  create(
    icons: readonly TAsterIconManifestEntry[],
    collections: readonly TAsterCollectionManifestEntry[],
  ): CatalogueDiscovery {
    const iconsByKey = new Map<string, TAsterIconManifestEntry>();
    const membershipsByKey = new Map<string, TAsterCollectionManifestEntry[]>();

    for (const icon of icons) {
      if (iconsByKey.has(icon.key)) {
        throw new TypeError(`Duplicate canonical icon manifest key ${icon.key}`);
      }

      iconsByKey.set(icon.key, icon);
      membershipsByKey.set(icon.key, []);
    }

    const collectionKeys = new Set<string>();
    const collectionRecords = collections.map<CatalogueDiscoveryCollectionRecord>(
      (collection) => {
        if (collectionKeys.has(collection.key)) {
          throw new TypeError(
            `Duplicate canonical collection manifest key ${collection.key}`,
          );
        }

        collectionKeys.add(collection.key);
        const members = collection.members.map((memberKey) => {
          const icon = iconsByKey.get(memberKey);

          if (icon === undefined) {
            throw new TypeError(
              `Collection ${collection.key} contains unavailable icon ${memberKey}`,
            );
          }

          membershipsByKey.get(memberKey)?.push(collection);
          return icon.identity;
        });

        return Object.freeze({
          identity: collection.identity,
          metadata: collection.metadata,
          icons: Object.freeze(members),
        });
      },
    );
    const iconRecords = icons.map<CatalogueDiscoveryIconRecord>((icon) =>
      Object.freeze({
        identity: icon.identity,
        metadata: Object.freeze({
          displayName: icon.displayName,
          ...(icon.tags === undefined ? {} : { tags: icon.tags }),
          rtl: icon.rtl,
          ...(icon.licence === undefined ? {} : { licence: icon.licence }),
          ...(icon.attribution === undefined
            ? {}
            : { attribution: icon.attribution }),
          deprecated: icon.deprecated,
          ...(icon.replacedBy === undefined
            ? {}
            : { replacedBy: icon.replacedBy }),
        }),
        memberships: Object.freeze(
          (membershipsByKey.get(icon.key) ?? []).map(
            (collection) => collection.identity,
          ),
        ),
      }),
    );

    return Object.freeze({
      icons: Object.freeze(iconRecords),
      collections: Object.freeze(collectionRecords),
    });
  }
}
