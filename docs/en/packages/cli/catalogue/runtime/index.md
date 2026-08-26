# CLI Catalogue Runtime

Status: **Experimental**

The internal catalogue runtime separates provider acceptance from list, search, and exact lookup
queries. None of these classes is exported through a package subpath.

| Class | Responsibility |
| --- | --- |
| `AsterCatalogueProvider` | Lazily adapts `AsterCollection` into one complete provider snapshot. |
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

Provider order is normalised through locale-independent ASCII comparison before loading. A
snapshot must be an exact plain data record containing dense ordinary icon and collection arrays;
individual records follow the same own-data boundary. Portable icon and collection candidates are
then reconstructed through `@aster/core`, while CLI-owned memberships, search terms, conflicts,
and provider evidence remain under CLI validation. One rejected provider prevents any partial
catalogue payload or export plan from becoming observable. Rejected provider promises and
exceptions raised while inspecting provider-owned snapshot structure both become sanitised
`catalogue-unavailable` diagnostics associated with the accepted provider identity.
