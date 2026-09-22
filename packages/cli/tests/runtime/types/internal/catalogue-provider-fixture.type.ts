import type {
  CollectionDefinition,
  CollectionIdentity,
  IconDefinition,
} from "@luscious-garden/aster-core";

export type TCatalogueProviderFixture = Readonly<{
  icons: readonly Readonly<{
    definition: IconDefinition;
    memberships: readonly CollectionIdentity[];
    searchTerms?: readonly string[];
  }>[];
  collections: readonly Readonly<{
    definition: CollectionDefinition;
    searchTerms?: readonly string[];
  }>[];
}>;
