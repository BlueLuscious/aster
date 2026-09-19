# CLI Catalogue Runtime

Status: **Pre-release**

The internal catalogue runtime separates metadata discovery from complete-definition loading.
None of these classes is exported through a package subpath.

| Class | Responsibility |
| --- | --- |
| `AsterCatalogueProvider` | Lazily acquires canonical Icons manifests and exposes independent exact definition loaders. |
| `AsterCatalogueDiscoveryFactory` | Adapts manifest entries and derives bidirectional membership evidence without evaluating definitions. |
| `CatalogueLoader` | Orders explicit providers and accepts metadata-only discovery results. |
| `CatalogueDiscoveryNormaliser` | Coordinates strict discovery-container acceptance, cross-checking, ordering, and freezing. |
| `CatalogueDiscoveryRecordNormaliser` | Accepts and isolates icon and collection discovery records. |
| `CatalogueDiscoveryIdentityNormaliser` | Accepts portable icon and collection identities from untrusted discovery values. |
| `CatalogueDiscoveryMetadataNormaliser` | Accepts lightweight icon metadata and descriptive collection metadata. |
| `CatalogueDiscoveryMembershipValidator` | Validates bidirectional agreement between icon memberships and collection members. |
| `CatalogueDiscoverySelector` | Resolves exact metadata records with provider filtering and ambiguity handling. |
| `CatalogueDefinitionResolver` | Invokes one selected exact loader, reconstructs its result through Core, and returns complete immutable command evidence. |
| `CatalogueDefinitionConsistencyValidator` | Verifies loaded identity, metadata, and collection membership against accepted discovery evidence. |
| `CatalogueIdentityFormatter` | Formats portable identities for exact matching and ordering. |
| `CatalogueQueryScope` | Applies shared provider, collection, membership, and tag filters. |
| `CatalogueResultFactory` | Projects accepted discovery records into public immutable evidence. |
| `CatalogueListQuery` | Produces provider, collection, and icon list payloads. |
| `CatalogueSearchQuery` | Matches mixed records against deterministic search terms. |
| `CatalogueShowQuery` | Resolves one exact metadata record without loading a definition. |

`TAcceptedCatalogueDiscovery` associates one canonical provider identity with canonically ordered,
isolated discovery records. It is the immutable hand-off from provider acceptance to list, search,
show, and later exact selection; it is not a public provider result.

`TCatalogueDiscoverySelection` retains one exact provider, requested identity, selected record, and
the discovery icon records required by that subject. It contains no complete definition.
`TCatalogueSelection` is the downstream immutable result containing the isolated definition and
canonically ordered icon evidence required by Export or Review.

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

## Exact definition resolution

Exact resolution begins only after metadata selection has resolved provider scope, identity, and
ambiguity. An icon selection invokes `loadIcon()` once. A collection selection invokes
`loadCollection()` once and uses the complete members carried by that collection definition; it
does not invoke individual icon loaders.

Every loaded value crosses `Icon.define()` or `Collection.define()` before command state can retain
it. The consistency validator then compares canonical identity and metadata. Collection resolution
also compares the ordered member identities and validates every loaded member against its accepted
icon discovery record. Results are isolated and deeply immutable even when a provider returns
mutable authored data.

An absent provider, missing value, rejected loader, malformed definition, identity mismatch,
metadata mismatch, or membership mismatch becomes one sanitised `catalogue-unavailable`
diagnostic containing only accepted provider and identity evidence. The resolver retains no cache;
each invocation represents one explicit provider operation.

`CatalogueSubjectSelector` composes metadata selection with this exact resolver for Export and
Review. No complete-provider snapshot, eager definition index, or aggregate loader exists in the
runtime or public contracts.
