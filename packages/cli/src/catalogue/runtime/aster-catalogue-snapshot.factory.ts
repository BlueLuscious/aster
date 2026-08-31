import type {
  CollectionDefinition,
  CollectionIdentity,
  IconDefinition,
} from "@aster/core";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
  CatalogueSnapshot,
} from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Adapts canonical Icons indexes into one deterministic built-in catalogue snapshot.
 */
export class AsterCatalogueSnapshotFactory {
  /**
   * @description Locale-independent ordering authority for canonical identities.
   */
  readonly #ascii = new AsciiStringComparator();

  /**
   * @description Canonical portable identity formatter used for indexing and ordering.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Creates one snapshot from independent canonical icon and collection indexes.
   * @param icons - Complete canonical icon index.
   * @param collections - Complete canonical collection index.
   * @returns Deeply immutable records with memberships derived from collection contents.
   */
  create(
    icons: readonly IconDefinition[],
    collections: readonly CollectionDefinition[],
  ): CatalogueSnapshot {
    const iconsByIdentity = new Map<string, IconDefinition>();
    const membershipsByIdentity = new Map<string, CollectionIdentity[]>();

    for (const icon of icons) {
      const identity = this.#identities.icon(icon.identity);

      if (iconsByIdentity.has(identity)) {
        throw new TypeError(`Duplicate canonical icon identity ${identity}`);
      }

      iconsByIdentity.set(identity, icon);
      membershipsByIdentity.set(identity, []);
    }

    const collectionIdentities = new Set<string>();

    for (const collection of collections) {
      const collectionIdentity = this.#identities.collection(
        collection.identity,
      );

      if (collectionIdentities.has(collectionIdentity)) {
        throw new TypeError(
          `Duplicate canonical collection identity ${collectionIdentity}`,
        );
      }

      collectionIdentities.add(collectionIdentity);

      for (const member of collection.icons) {
        const memberIdentity = this.#identities.icon(member.identity);
        const indexed = iconsByIdentity.get(memberIdentity);

        if (indexed === undefined) {
          throw new TypeError(
            `Collection ${collectionIdentity} contains unavailable icon ${memberIdentity}`,
          );
        }

        if (indexed !== member) {
          throw new TypeError(
            `Collection ${collectionIdentity} contains conflicting icon ${memberIdentity}`,
          );
        }

        membershipsByIdentity.get(memberIdentity)?.push(collection.identity);
      }
    }

    const iconRecords = icons.map<CatalogueIconRecord>((definition) => {
      const identity = this.#identities.icon(definition.identity);
      const memberships = membershipsByIdentity.get(identity) ?? [];

      memberships.sort((left, right) =>
        this.#ascii.compare(
          this.#identities.collection(left),
          this.#identities.collection(right),
        ),
      );

      return Object.freeze({
        definition,
        memberships: Object.freeze(memberships),
      });
    });
    const collectionRecords = collections.map<CatalogueCollectionRecord>(
      (definition) => Object.freeze({ definition }),
    );

    iconRecords.sort((left, right) =>
      this.#ascii.compare(
        this.#identities.icon(left.definition.identity),
        this.#identities.icon(right.definition.identity),
      ),
    );
    collectionRecords.sort((left, right) =>
      this.#ascii.compare(
        this.#identities.collection(left.definition.identity),
        this.#identities.collection(right.definition.identity),
      ),
    );

    return Object.freeze({
      icons: Object.freeze(iconRecords),
      collections: Object.freeze(collectionRecords),
    });
  }
}
