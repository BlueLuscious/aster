# CLI Catalogue

Status: **Pre-release**

The catalogue feature accepts explicit providers, isolates lightweight discovery metadata, and
performs host-neutral catalogue queries. It has no ambient provider registry and does not infer
providers from installed packages or the filesystem.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `CatalogueProvider` | Exposes one canonical provider identity, metadata discovery, and exact icon and collection definition loaders. | Supplied explicitly through `AsterCommandContext`. |
| `CatalogueDiscovery` | Retains the complete metadata-only icon and collection state for one provider execution. | Contains `CatalogueDiscoveryIconRecord` and `CatalogueDiscoveryCollectionRecord` values. |
| `CatalogueDiscoveryIconRecord` | Retains one icon identity, lightweight metadata, independent memberships, and optional provider search terms. | Contains no geometry, nodes, view box, or presentation policy. |
| `CatalogueDiscoveryCollectionRecord` | Retains one collection identity, descriptive metadata, member identities, and optional provider search terms. | Contains no complete icon or collection definition. |
| `CatalogueIconMetadata` | Defines the icon metadata available without definition evaluation. | Mirrors searchable Core metadata except presentation, which belongs to a complete definition. |
| `CatalogueProviderResult` | Reports one discovered provider identity and accepted record counts. | Returned by catalogue listing. |
| `CatalogueIconResult` | Reports one icon identity, lightweight metadata, provider, and independent memberships. | Returned by icon list, search, and exact show. |
| `CatalogueCollectionResult` | Reports one collection identity, metadata, provider, and member identities. | Returned by collection list, search, and exact show. |

`CatalogueSnapshot`, `CatalogueIconRecord`, and `CatalogueCollectionRecord` remain transitional
complete-definition contracts while Export and Review migrate to exact loading. They are not
returned by `CatalogueProvider` and discovery commands do not consume them.

## Public types and authorities

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `CatalogueResultKindType` | Identifies an icon or collection discovery result. | Derived from `catalogueResultKinds`. |
| `catalogueResultKinds` | Provides the immutable runtime discriminators for public catalogue results. | Used by result contracts, projectors, and consumers that narrow mixed search results. |

Provider provenance, computed search terms, and many-to-many catalogue membership remain outside
portable Core metadata. Equal portable identities from different providers remain distinct
catalogue results until exact lookup rules resolve or reject them.

## Provider lifecycle

`CatalogueProvider.discover()` returns metadata only. `loadIcon()` and `loadCollection()` resolve
one exact identity after discovery has established provider scope and availability. An absent
loader result for an identity promised by discovery is provider failure, not `not-found`.

Context acceptance snapshots all three callable capabilities without invoking them and preserves
the original receiver required by class implementations. Each discovery command then:

1. orders explicit providers by canonical provider identity;
2. invokes `discover()` once per selected provider;
3. validates exact plain-data structure, identities, metadata, and search terms;
4. cross-checks bidirectional collection membership without loading definitions;
5. orders and freezes isolated records before a query executes.

A provider rejection, reflective value, malformed record, duplicate identity, unavailable member,
or inconsistent membership becomes a sanitised failure. Native exception text and provider-owned
object identity never become observable command state.

## Built-in provider

`AsterCatalogue` is the explicit built-in provider. Discovery dynamically imports
`@aster/icons/manifest`, derives icon memberships from collection member keys, and returns no
complete definitions. Exact loaders dynamically acquire `@aster/icons/dynamic` only when invoked.
The provider does not register itself globally; hosts include it explicitly in
`AsterCommandContext.catalogues`.

## Discovery semantics

`list` returns providers, collections, or icons in provider and canonical identity order. Icon
filters require exact provider, collection, and intrinsic-tag matches. Standalone icons and empty
collections remain discoverable.

`search` is case-insensitive and requires every whitespace-delimited query term to occur in at
least one canonical identity, display name, intrinsic tag, or explicit provider search term.
Provider terms remain catalogue data and never mutate portable metadata.

`show` resolves one exact metadata record and invokes no definition loader. Equal identities from
multiple selected providers produce an explicit ambiguity failure; an exact provider filter
resolves that ambiguity. Icon show results deliberately omit presentation because presentation is
available only on a complete definition.

[Catalogue Runtime](runtime/index.md) documents internal acceptance and query composition.
[CLI Workflow](../workflow.md) defines how hosts supply providers without an ambient registry.
