import type {
  CollectionDefinition,
  CollectionMetadata,
  IconDefinition,
  IconIdentity,
  IconMetadata,
} from "@luscious-garden/aster-core";
import type {
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
  CatalogueIconMetadata,
} from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Verifies agreement between accepted discovery records and loaded definitions.
 */
export class CatalogueDefinitionConsistencyValidator {
  /** @description Canonical portable identity formatter used for exact comparisons. */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Inspects one loaded icon against its selected discovery record.
   * @param record - Accepted metadata-only icon record.
   * @param definition - Isolated complete icon definition.
   * @returns Deterministic failure message or no value when both authorities agree.
   */
  icon(
    record: CatalogueDiscoveryIconRecord,
    definition: IconDefinition,
  ): string | undefined {
    const identity = this.#identities.icon(record.identity);

    if (this.#identities.icon(definition.identity) !== identity) {
      return `icon ${identity} loader returned a mismatched identity`;
    }

    return this.#iconMetadataMatches(record.metadata, definition.metadata)
      ? undefined
      : `icon ${identity} loader returned metadata inconsistent with discovery`;
  }

  /**
   * @description Inspects one loaded collection and every member against discovery evidence.
   * @param record - Accepted metadata-only collection record.
   * @param icons - Accepted discovery records for every selected member.
   * @param definition - Isolated complete collection definition.
   * @returns Deterministic failure message or no value when identity, metadata, and members agree.
   */
  collection(
    record: CatalogueDiscoveryCollectionRecord,
    icons: readonly CatalogueDiscoveryIconRecord[],
    definition: CollectionDefinition,
  ): string | undefined {
    const identity = this.#identities.collection(record.identity);

    if (this.#identities.collection(definition.identity) !== identity) {
      return `collection ${identity} loader returned a mismatched identity`;
    }

    if (!this.#collectionMetadataMatches(record.metadata, definition.metadata)) {
      return `collection ${identity} loader returned metadata inconsistent with discovery`;
    }

    const discoveredMembers = record.icons.map((member) =>
      this.#identities.icon(member),
    );
    const loadedMembers = definition.members.map((member) =>
      this.#identities.icon(member.identity),
    );
    const selectedMembers = icons.map((icon) =>
      this.#identities.icon(icon.identity),
    );

    if (
      selectedMembers.length !== discoveredMembers.length
      || selectedMembers.some((member) => !discoveredMembers.includes(member))
    ) {
      return `collection ${identity} discovery member evidence is inconsistent`;
    }

    if (!this.#sequenceMatches(discoveredMembers, loadedMembers)) {
      return `collection ${identity} loader returned members inconsistent with discovery`;
    }

    const iconsByIdentity = new Map(icons.map((icon) => [
      this.#identities.icon(icon.identity),
      icon,
    ]));

    for (const member of definition.members) {
      const memberIdentity = this.#identities.icon(member.identity);
      const discovery = iconsByIdentity.get(memberIdentity);

      if (discovery === undefined) {
        return `collection ${identity} loader returned unavailable member ${memberIdentity}`;
      }

      const failure = this.icon(discovery, member);

      if (failure !== undefined) {
        return failure;
      }
    }

    return undefined;
  }

  /**
   * @description Compares lightweight discovery metadata with complete icon metadata.
   * @param discovery - Accepted metadata without presentation.
   * @param loaded - Loaded complete metadata with presentation.
   * @returns Whether every discovery-owned field agrees exactly.
   */
  #iconMetadataMatches(
    discovery: CatalogueIconMetadata,
    loaded: IconMetadata,
  ): boolean {
    return discovery.displayName === loaded.displayName
      && this.#sequenceMatches(discovery.tags, loaded.tags)
      && discovery.rtl === loaded.rtl
      && discovery.licence === loaded.licence
      && discovery.attribution === loaded.attribution
      && discovery.deprecated === loaded.deprecated
      && this.#iconIdentityMatches(discovery.replacedBy, loaded.replacedBy);
  }

  /**
   * @description Compares complete descriptive collection metadata.
   * @param discovery - Accepted discovery metadata.
   * @param loaded - Loaded complete metadata.
   * @returns Whether every collection metadata field agrees exactly.
   */
  #collectionMetadataMatches(
    discovery: CollectionMetadata,
    loaded: CollectionMetadata,
  ): boolean {
    return discovery.displayName === loaded.displayName
      && discovery.description === loaded.description
      && this.#sequenceMatches(discovery.tags, loaded.tags)
      && discovery.licence === loaded.licence
      && discovery.attribution === loaded.attribution;
  }

  /**
   * @description Compares optional complete icon identities.
   * @param left - First optional identity.
   * @param right - Second optional identity.
   * @returns Whether absence or canonical identity agrees.
   */
  #iconIdentityMatches(
    left: IconIdentity | undefined,
    right: IconIdentity | undefined,
  ): boolean {
    return left === undefined || right === undefined
      ? left === right
      : this.#identities.icon(left) === this.#identities.icon(right);
  }

  /**
   * @description Compares optional ordered string sequences without retaining either input.
   * @param left - First optional sequence.
   * @param right - Second optional sequence.
   * @returns Whether absence, length, and every ordered value agree.
   */
  #sequenceMatches(
    left: readonly string[] | undefined,
    right: readonly string[] | undefined,
  ): boolean {
    if (left === undefined || right === undefined) {
      return left === right;
    }

    return left.length === right.length
      && left.every((value, index) => value === right[index]);
  }
}
