import type {
  CollectionIdentity,
  IconIdentity,
  IconMetadata,
} from "@aster/core";
import type {
  CatalogueDiscovery,
  CatalogueIconMetadata,
  CatalogueProvider,
} from "../../src/catalogue/contracts/index.js";
import type { TCatalogueProviderFixture } from "./types/internal/catalogue-provider-fixture.type.js";

/**
 * @description Creates one complete test provider from local definition fixtures.
 * @param identity - Canonical fixture provider identity.
 * @param fixture - Complete definitions and membership evidence for the provider fixture.
 * @param observers - Optional capability invocation observers.
 * @returns Explicit discovery and exact-loading provider.
 */
export function createCatalogueProvider(
  identity: string,
  fixture: TCatalogueProviderFixture,
  observers: Readonly<{
    /** @description Optional discovery invocation observer. */
    onDiscover?: () => void;
    /** @description Optional exact icon-loader invocation observer. */
    onLoadIcon?: (identity: IconIdentity) => void;
    /** @description Optional exact collection-loader invocation observer. */
    onLoadCollection?: (identity: CollectionIdentity) => void;
  }> = {},
): CatalogueProvider {
  const iconsByIdentity = new Map(fixture.icons.map((record) => [
    iconIdentity(record.definition.identity),
    record.definition,
  ]));
  const collectionsByIdentity = new Map(fixture.collections.map((record) => [
    collectionIdentity(record.definition.identity),
    record.definition,
  ]));
  const discovery: CatalogueDiscovery = Object.freeze({
    icons: Object.freeze(fixture.icons.map((record) => Object.freeze({
      identity: record.definition.identity,
      metadata: discoveryMetadata(record.definition.metadata),
      memberships: record.memberships,
      ...(record.searchTerms === undefined
        ? {}
        : { searchTerms: record.searchTerms }),
    }))),
    collections: Object.freeze(fixture.collections.map((record) => Object.freeze({
      identity: record.definition.identity,
      metadata: record.definition.metadata,
      icons: Object.freeze(record.definition.icons.map((icon) => icon.identity)),
      ...(record.searchTerms === undefined
        ? {}
        : { searchTerms: record.searchTerms }),
    }))),
  });

  return Object.freeze({
    identity,
    async discover() {
      observers.onDiscover?.();
      return discovery;
    },
    async loadIcon(selectedIdentity: IconIdentity) {
      observers.onLoadIcon?.(selectedIdentity);
      return iconsByIdentity.get(iconIdentity(selectedIdentity));
    },
    async loadCollection(selectedIdentity: CollectionIdentity) {
      observers.onLoadCollection?.(selectedIdentity);
      return collectionsByIdentity.get(collectionIdentity(selectedIdentity));
    },
  });
}

/**
 * @description Removes complete-definition presentation policy from fixture discovery metadata.
 * @param metadata - Complete canonical icon metadata.
 * @returns Lightweight discovery metadata.
 */
function discoveryMetadata(
  metadata: IconMetadata,
): CatalogueIconMetadata {
  return Object.freeze({
    displayName: metadata.displayName,
    ...(metadata.tags === undefined ? {} : { tags: metadata.tags }),
    rtl: metadata.rtl,
    ...(metadata.licence === undefined ? {} : { licence: metadata.licence }),
    ...(metadata.attribution === undefined
      ? {}
      : { attribution: metadata.attribution }),
    deprecated: metadata.deprecated,
    ...(metadata.replacedBy === undefined
      ? {}
      : { replacedBy: metadata.replacedBy }),
  });
}

/**
 * @description Formats one icon identity for deterministic fixture lookup.
 * @param identity - Portable icon identity.
 * @returns Canonical textual identity.
 */
function iconIdentity(identity: IconIdentity): string {
  return `${identity.namespace === undefined ? "" : `${identity.namespace}/`}${identity.name}${identity.variant === undefined ? "" : `@${identity.variant}`}`;
}

/**
 * @description Formats one collection identity for deterministic fixture lookup.
 * @param identity - Portable collection identity.
 * @returns Canonical textual identity.
 */
function collectionIdentity(identity: CollectionIdentity): string {
  return `${identity.namespace === undefined ? "" : `${identity.namespace}/`}${identity.name}`;
}
