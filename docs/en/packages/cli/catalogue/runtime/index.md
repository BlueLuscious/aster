# CLI Catalogue Runtime

Status: **Pre-release**

The internal catalogue runtime separates provider acceptance from list, search, and exact lookup
queries. None of these classes is exported through a package subpath.

| Class | Responsibility |
| --- | --- |
| `AsterCatalogueProvider` | Lazily acquires the independent canonical Icons indexes. |
| `AsterCatalogueSnapshotFactory` | Validates indexed identity-to-object relations and derives one deterministic built-in snapshot. |
| `CatalogueLoader` | Orders and invokes explicit providers once per query and returns accepted snapshots or one deterministic failure. |
| `CatalogueSnapshotNormaliser` | Validates, isolates, cross-checks, orders, and freezes one snapshot. |
| `CatalogueRecordNormaliser` | Accepts individual icon and collection records and resolves membership identities. |
| `CatalogueMembershipValidator` | Validates bidirectional agreement between collection members and icon evidence. |
| `CatalogueIdentityFormatter` | Formats portable icon and collection identities for exact matching and ordering. |
| `CatalogueQueryScope` | Applies shared exact provider, collection, membership, and tag filters. |
| `CatalogueResultFactory` | Projects accepted records into public immutable evidence without geometry. |
| `CatalogueListQuery` | Produces provider, collection, and icon list payloads. |
| `CatalogueSearchQuery` | Matches mixed icon and collection records against deterministic search terms. |
| `CatalogueShowQuery` | Resolves one exact identity or returns not-found or ambiguity evidence. |

The internal `TAcceptedCatalogue` type associates one canonical provider identity with its
canonically ordered, isolated icon and collection records. It is the immutable hand-off from
snapshot acceptance to queries and export selection; it is not a public provider result.

```text
explicit providers --> loader --> snapshot normaliser --> accepted catalogues
                                                           |
                                      +--------------------+--------------------+
                                      |                    |                    |
                                    list                 search                show
                                      |                    |                    |
                                      +--------------------+--------------------+
                                                           |
                                              immutable command payload
```

The loader retains no catalogue cache or global registry. Every command execution observes one
complete snapshot from every selected explicit provider. Search aliases and provider provenance
remain outside Core definitions.

The built-in snapshot factory indexes every canonical icon independently, derives memberships from
all canonical collections, and orders both record families before returning the provider snapshot.
It rejects duplicate indexed identities, unavailable collection members and a member object that
differs from the canonical indexed definition. This source-authority check belongs to the built-in
provider; generic provider snapshots continue through the complete loader acceptance boundary.

Provider order is normalised through locale-independent ASCII comparison before loading. A
snapshot must be an exact plain data record containing dense ordinary icon and collection arrays;
individual records follow the same own-data boundary. Portable icon and collection candidates are
then reconstructed through `@aster/core`, while CLI-owned memberships, search terms, conflicts,
and provider evidence remain under CLI validation. One rejected provider prevents any partial
catalogue payload or export plan from becoming observable. Rejected provider promises and
exceptions raised while inspecting provider-owned snapshot structure both become sanitised
`catalogue-unavailable` diagnostics associated with the accepted provider identity.
