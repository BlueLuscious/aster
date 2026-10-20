import type {
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
} from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Validates bidirectional agreement between discovery membership records.
 */
export class CatalogueDiscoveryMembershipValidator {
  /** @description Canonical portable identity formatter used for evidence comparison. */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Inspects accepted discovery records for bidirectional membership agreement.
   * @remarks Membership claims are indexed only for this inspection. Collection order, declared
   * member order and icon insertion order retain deterministic first-failure precedence.
   * @param collections - Accepted collection discovery records.
   * @param iconsByIdentity - Accepted icon discovery records indexed by canonical identity.
   * @returns Deterministic failure message or no value when evidence agrees.
   */
  inspect(
    collections: readonly CatalogueDiscoveryCollectionRecord[],
    iconsByIdentity: ReadonlyMap<string, CatalogueDiscoveryIconRecord>,
  ): string | undefined {
    if (collections.length === 0) {
      return undefined;
    }

    const claimsByCollection = new Map<string, Set<string>>();

    for (const icon of iconsByIdentity.values()) {
      const iconKey = this.#identities.icon(icon.identity);

      for (const membership of icon.memberships) {
        const collectionKey = this.#identities.collection(membership);
        let claims = claimsByCollection.get(collectionKey);

        if (claims === undefined) {
          claims = new Set<string>();
          claimsByCollection.set(collectionKey, claims);
        }

        claims.add(iconKey);
      }
    }

    for (const collection of collections) {
      const collectionKey = this.#identities.collection(collection.identity);
      const claims = claimsByCollection.get(collectionKey);
      const memberKeys = new Set(
        collection.memberIdentities.map((icon) => this.#identities.icon(icon)),
      );

      for (const memberKey of memberKeys) {
        if (!iconsByIdentity.has(memberKey)) {
          return `collection ${collectionKey} contains unavailable icon ${memberKey}`;
        }

        if (claims?.has(memberKey) !== true) {
          return `icon ${memberKey} omits collection membership ${collectionKey}`;
        }
      }

      for (const iconKey of claims ?? []) {
        if (!memberKeys.has(iconKey)) {
          return `icon ${iconKey} claims unavailable membership ${collectionKey}`;
        }
      }
    }

    return undefined;
  }
}
