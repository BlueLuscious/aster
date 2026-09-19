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
   * @param collections - Accepted collection discovery records.
   * @param iconsByIdentity - Accepted icon discovery records indexed by canonical identity.
   * @returns Deterministic failure message or no value when evidence agrees.
   */
  inspect(
    collections: readonly CatalogueDiscoveryCollectionRecord[],
    iconsByIdentity: ReadonlyMap<string, CatalogueDiscoveryIconRecord>,
  ): string | undefined {
    for (const collection of collections) {
      const collectionKey = this.#identities.collection(collection.identity);
      const memberKeys = new Set(
        collection.icons.map((icon) => this.#identities.icon(icon)),
      );

      for (const memberKey of memberKeys) {
        const icon = iconsByIdentity.get(memberKey);

        if (icon === undefined) {
          return `collection ${collectionKey} contains unavailable icon ${memberKey}`;
        }

        const membershipKeys = icon.memberships.map((membership) =>
          this.#identities.collection(membership),
        );

        if (!membershipKeys.includes(collectionKey)) {
          return `icon ${memberKey} omits collection membership ${collectionKey}`;
        }
      }

      for (const icon of iconsByIdentity.values()) {
        const iconKey = this.#identities.icon(icon.identity);
        const claimsMembership = icon.memberships.some(
          (membership) => this.#identities.collection(membership) === collectionKey,
        );

        if (claimsMembership && !memberKeys.has(iconKey)) {
          return `icon ${iconKey} claims unavailable membership ${collectionKey}`;
        }
      }
    }

    return undefined;
  }
}
