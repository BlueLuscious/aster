# CLI Catalogue

Status: **Experimental**

The catalogue feature defines explicit provider and snapshot contracts, accepts portable values,
and performs host-neutral discovery. It has no ambient provider registry.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `CatalogueProvider` | Identifies and asynchronously loads one explicit catalogue snapshot. | Supplied through `AsterCommandContext`; invoked only by catalogue commands. |
| `CatalogueSnapshot` | Retains the complete icon and collection record sequences for one provider load. | Contains `CatalogueIconRecord` and `CatalogueCollectionRecord` values. |
| `CatalogueIconRecord` | Retains one portable icon, independent collection memberships, and optional provider search terms. | Uses Core `IconDefinition` and `CollectionIdentity`; accepted values are isolated through Core. |
| `CatalogueCollectionRecord` | Retains one portable collection and optional provider search terms. | Uses Core `CollectionDefinition`; membership remains owned by that portable collection. |
| `CatalogueProviderResult` | Reports one loaded provider identity and accepted record counts. | Returned by catalogue listing. |
| `CatalogueIconResult` | Reports one icon identity, metadata, provider, and independent memberships. | Returned by icon list, search, and exact show. |
| `CatalogueCollectionResult` | Reports one collection identity, metadata, provider, and member identities. | Returned by collection list, search, and exact show. |

## Public types and authorities

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `CatalogueResultKindType` | Identifies an icon or collection discovery result. | Derived from `catalogueResultKinds`. |
| `catalogueResultKinds` | Provides the immutable runtime discriminators for public catalogue results. | Used by result contracts, projectors, and consumers that narrow mixed search results. |

Provider provenance, computed search terms, and many-to-many catalogue membership remain outside
portable Core metadata. Equal portable identities from different providers remain distinct
catalogue results until explicit lookup rules resolve or reject them.

## Public API

`AsterCatalogue` is the explicit built-in `CatalogueProvider`. Its snapshot adapts
`AsterCollection` and the collection's current canonical icon set from `@aster/icons`. It does not
register itself globally or become a default inside `AsterCommands`; a standalone or programmatic
host must include it in `AsterCommandContext.catalogues`.

## Loading lifecycle

Context acceptance validates provider identity and callable shape without loading a snapshot.
Each catalogue command then:

1. orders explicit providers by canonical provider identity;
2. invokes each provider exactly once for that command execution;
3. validates and isolates supplied definitions through `Icon.define()` and
   `Collection.define()`;
4. rejects duplicate identities, unavailable memberships, and inconsistent bidirectional
   membership evidence;
5. orders and freezes accepted records before any query executes.

A provider exception becomes a sanitised `catalogue-unavailable` failure. Native exception text is
never retained in a command result. Accepted definition semantics are preserved, but supplied
object identity is not an observable guarantee because the loader isolates values through Core.

## Discovery semantics

`list` returns providers, collections, or icons in provider and canonical identity order. Icon
filters require exact provider, collection, and intrinsic-tag matches. An icon remains discoverable
when its membership sequence is empty.

`search` is case-insensitive and requires every whitespace-delimited query term to occur in at
least one canonical identity, display name, intrinsic tag, or explicit provider search term.
Provider terms remain catalogue data and never mutate portable metadata. Results are ordered by
provider, portable identity, and result kind.

`show` accepts one exact icon or collection identity. Equal identities from multiple selected
providers produce an explicit ambiguity failure; an exact provider filter resolves that ambiguity.
The initial pilot catalogue is small, so the current API returns the complete deterministic result
sequence and deliberately defines no pagination contract.

[Catalogue Runtime](runtime/index.md) documents the internal acceptance and query composition. The
accepted provider boundary is defined by the
[Command-line Boundary](../../../architecture/command-line-boundary.md).
