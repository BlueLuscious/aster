# CLI Catalogue Runtime

Status: **Pre-release**

The internal catalogue runtime separates metadata discovery from complete-definition loading.
None of these classes is exported through a package subpath.

| Class | Responsibility |
| --- | --- |
| `AsterCatalogueProvider` | Lazily acquires canonical Icons manifests and exposes independent exact definition loaders. |
| `AsterCatalogueDiscoveryFactory` | Adapts manifest entries and derives bidirectional membership evidence without evaluating definitions. |
| `CatalogueLoader` | Orders providers, accepts discovery metadata, and retains a temporary complete-definition bridge for Export and Review. |
| `CatalogueDiscoveryNormaliser` | Coordinates strict discovery-container acceptance, cross-checking, ordering, and freezing. |
| `CatalogueDiscoveryRecordNormaliser` | Accepts and isolates icon and collection discovery records. |
| `CatalogueDiscoveryIdentityNormaliser` | Accepts portable icon and collection identities from untrusted discovery values. |
| `CatalogueDiscoveryMetadataNormaliser` | Accepts lightweight icon metadata and descriptive collection metadata. |
| `CatalogueDiscoveryMembershipValidator` | Validates bidirectional agreement between icon memberships and collection members. |
| `CatalogueDiscoverySelector` | Resolves exact metadata records with provider filtering and ambiguity handling. |
| `CatalogueIdentityFormatter` | Formats portable identities for exact matching and ordering. |
| `CatalogueQueryScope` | Applies shared provider, collection, membership, and tag filters. |
| `CatalogueResultFactory` | Projects accepted discovery records into public immutable evidence. |
| `CatalogueListQuery` | Produces provider, collection, and icon list payloads. |
| `CatalogueSearchQuery` | Matches mixed records against deterministic search terms. |
| `CatalogueShowQuery` | Resolves one exact metadata record without loading a definition. |

`TAcceptedCatalogueDiscovery` associates one canonical provider identity with canonically ordered,
isolated discovery records. It is the immutable hand-off from provider acceptance to list, search,
show, and later exact selection; it is not a public provider result.

```text
explicit providers --> discover --> discovery normaliser --> accepted discoveries
                                                               |
                                          +--------------------+--------------------+
                                          |                    |                    |
                                        list                 search                show
                                          |                    |                    |
                                          +--------------------+--------------------+
                                                               |
                                                  immutable command payload
```

The loader retains no cache or global registry. Provider order is normalised through
locale-independent ASCII comparison. Discovery must be an exact plain data record containing
dense ordinary icon and collection arrays. Nested identities and metadata follow the same
own-data boundary, and all accepted values are reconstructed, ordered, and frozen under CLI
ownership.

Presentation, view boxes, nodes, and complete definitions are deliberately absent from discovery.
The built-in factory derives memberships from manifest collection members; the generic discovery
normaliser then verifies both directions independently. Search aliases and provider provenance
remain CLI-owned catalogue data rather than Core metadata.

One rejected provider prevents any partial payload from becoming observable. Rejected promises,
accessors, proxies, malformed fields, duplicate identities, unknown members, and inconsistent
membership claims become sanitised diagnostics associated with the accepted provider identity.

Export and Review still use `CatalogueLoader.loadDefinitions()` as a temporary migration bridge.
That path invokes every discovered exact loader and passes reconstructed records through the
legacy snapshot normaliser. It is not used by list, search, or show and will be removed after exact
selection and command workflow migration.
