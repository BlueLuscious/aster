import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
} from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Validates bidirectional agreement between collection members and icon evidence.
 */
export class CatalogueMembershipValidator {
  /**
   * @description Canonical portable identity formatter used for evidence comparison.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Inspects accepted records for complete bidirectional membership agreement.
   * @param collections - Accepted collection records.
   * @param iconsByIdentity - Accepted icon records indexed by canonical identity.
   * @returns Deterministic failure message or no value when evidence agrees.
   */
  inspect(
    collections: readonly CatalogueCollectionRecord[],
    iconsByIdentity: ReadonlyMap<string, CatalogueIconRecord>,
  ): string | undefined {
    for (const collection of collections) {
      const collectionKey = this.#identities.collection(
        collection.definition.identity,
      );
      const memberKeys = new Set(
        collection.definition.icons.map((icon) =>
          this.#identities.icon(icon.identity),
        ),
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
        const iconKey = this.#identities.icon(icon.definition.identity);
        const claimsMembership = icon.memberships.some(
          (membership) =>
            this.#identities.collection(membership) === collectionKey,
        );

        if (claimsMembership && !memberKeys.has(iconKey)) {
          return `icon ${iconKey} claims unavailable membership ${collectionKey}`;
        }
      }
    }

    return undefined;
  }
}
