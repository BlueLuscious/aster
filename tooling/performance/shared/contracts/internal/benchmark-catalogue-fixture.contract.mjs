/**
 * @description Stable synthetic catalogue values shared by package benchmark fixtures.
 * @typedef {object} IBenchmarkCatalogueFixture
 * @property {import("@luscious-garden/aster-core").IconDefinition} icon - Canonical representative icon.
 * @property {readonly import("@luscious-garden/aster-core").IconDefinition[]} icons - Canonical fixed-size icon corpus.
 * @property {import("@luscious-garden/aster-core").CollectionDefinition} collection - Canonical collection containing the complete corpus.
 * @property {{ readonly icons: readonly { readonly definition: import("@luscious-garden/aster-core").IconDefinition, readonly memberships: readonly import("@luscious-garden/aster-core").CollectionIdentity[] }[], readonly collections: readonly { readonly definition: import("@luscious-garden/aster-core").CollectionDefinition }[] }} snapshot - Immutable catalogue-provider snapshot.
 */

export {};
