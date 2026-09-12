/**
 * @description Stable synthetic catalogue values shared by package benchmark fixtures.
 * @typedef {object} IBenchmarkCatalogueFixture
 * @property {import("@aster/core").IconDefinition} icon - Canonical representative icon.
 * @property {readonly import("@aster/core").IconDefinition[]} icons - Canonical fixed-size icon corpus.
 * @property {import("@aster/core").CollectionDefinition} collection - Canonical collection containing the complete corpus.
 * @property {{ readonly icons: readonly { readonly definition: import("@aster/core").IconDefinition, readonly memberships: readonly import("@aster/core").CollectionIdentity[] }[], readonly collections: readonly { readonly definition: import("@aster/core").CollectionDefinition }[] }} snapshot - Immutable catalogue-provider snapshot.
 */

export {};
