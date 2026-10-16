# CLI Catalogue

Status: **Accepted**

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
| `CatalogueGlyphResult` | Reports one provider-scoped `IconGlyphIdentity` and its ordered `CatalogueIconResult` variants. | Derived from accepted concrete records for glyph list and show; contains no geometry, default selection or invented family metadata. |
| `CatalogueCollectionResult` | Reports one collection identity, metadata, provider, and member identities. | Returned by collection list, search, and exact show. |

## Public types and authorities

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `CatalogueResultKindType` | Identifies a glyph, icon or collection discovery result. | Derived from `catalogueResultKinds`; search remains limited to icons and collections. |
| `catalogueResultKinds` | Provides the immutable runtime discriminators for public catalogue results. | Used by result contracts, projectors, and consumers that narrow mixed search results. |

Provider provenance, computed search terms, and many-to-many catalogue membership remain outside
portable Core metadata. Equal portable identities from different providers remain distinct
catalogue results until exact lookup rules resolve or reject them.

## Provider lifecycle

`CatalogueProvider.discover()` returns metadata only. `loadIcon()` and `loadCollection()` resolve
one exact identity after discovery has established provider scope and availability. An absent
loader result for an identity promised by discovery is provider failure, not `not-found`.

The internal exact resolver accepts loaded values through Core and requires their identity,
metadata, and collection membership to agree with accepted discovery. Icon resolution invokes one
icon loader. Collection resolution invokes one collection loader and consumes only the members
carried by that definition's ordered `members` list; it does not issue redundant member loader
calls. Core validates the alias dictionary and its derived list before CLI compares canonical
membership with discovery. Collection-local aliases never become CLI identity shortcuts or
discovery fields. Export and Review use
this metadata-first exact-resolution path before constructing any plan.

Context acceptance snapshots all three callable capabilities without invoking them and preserves
the original receiver required by class implementations. Each discovery command then:

1. orders explicit providers by canonical provider identity;
2. invokes `discover()` once per supplied provider before exact query filtering;
3. validates exact plain-data structure, identities, metadata, and search terms;
4. cross-checks bidirectional collection membership without loading definitions;
5. orders and freezes isolated records before a query executes.

A provider rejection, reflective value, malformed record, duplicate identity, unavailable member,
or inconsistent membership becomes a sanitised failure. Native exception text and provider-owned
object identity never become observable command state.

## Built-in provider

`AsterCatalogue` is the explicit built-in provider. Discovery dynamically imports
`@luscious-garden/aster-icons/manifest`, derives icon memberships from collection member keys, and returns no
complete definitions. Exact loaders dynamically acquire `@luscious-garden/aster-icons/dynamic` only when invoked.
The provider does not register itself globally; hosts include it explicitly in
`AsterCommandContext.catalogues`.

## Discovery semantics

`list` returns providers, collections, glyphs or icons in provider and canonical identity order.
Standalone icons and empty collections remain discoverable. Glyphs derive from complete
`(namespace, name)` identities within each provider, never from dictionary imports or another
handwritten catalogue. No provider `loadGlyph()` capability is required.

| Form | Filters and result |
| --- | --- |
| `list glyphs` | Optional exact provider; returns `glyph-list` with `glyphs`. No tag, collection or glyph filter. |
| `show glyph [namespace/]name` | Optional exact provider; returns `glyph-show` with one `glyph`. A treatment suffix is invalid. |
| `list icons --glyph [namespace/]name` | Exact family predicate combined by AND with optional provider, collection and repeated intrinsic tags. Returns ordinary concrete `icon-list` results. |

Each glyph contains only `kind`, `catalogue`, variant-free `identity` and `variants`. Variants
retain complete accepted discovery metadata and memberships, ordered by concrete identity;
glyphs use provider then ASCII namespace/name order. No default, merged tags/licence, family
display name or second treatment-name list is invented. Equal families across providers remain
separate, and an absent namespace is distinct from `aster` or any other namespace.

Unknown provider, collection or glyph filters return not-found. Glyph existence is checked before
collection/tag predicates: a known family with an empty intersection succeeds with no icons,
while an unknown family cannot be hidden by an empty tag match. Filtering icons across several
providers retains each provider's results; exact show instead rejects cross-provider ambiguity.

`search` is case-insensitive and requires every whitespace-delimited query term to occur in at
least one canonical identity, display name, intrinsic tag, or explicit provider search term.
Provider terms remain catalogue data and never mutate portable metadata.

`show` resolves one exact metadata record and invokes no definition loader. Equal identities from
multiple selected providers produce an explicit ambiguity failure; an exact provider filter
resolves that ambiguity. Icon show results deliberately omit presentation because presentation is
available only on a complete definition.

Glyph-only inputs to concrete show, Export or Review are usage failures, not implicit Outline
selections. Invalid identities are `ASTER-CLI-001`; valid missing identities/treatments are `004`,
and exact cross-provider ambiguity is `005`. Discovery duplicates and provider failures retain
their existing conflict/unavailable diagnostics. All these metadata queries invoke no definition
loader; [Shell](../shell/index.md#command-grammar) owns argv and presentation syntax.

## Explicit treatment migration

This is a breaking [current-source contract](../../../index.md#source-and-published-versions),
not a claim about an already published CLI version. Replace an earlier glyph-only icon request
according to its intent:

```sh
aster show glyph aster/camera
aster show icon aster/camera@outline
```

The first discovers available treatments; the second selects one concrete definition. Export and
Review also require complete icon identities. For module imports, follow the
[Icons migration](../../icons/glyphs/index.md#explicit-treatment-migration), not the CLI `@` spelling.

Provider authors must supply explicit treatments in icon records, exact loader identities,
collection member identities and replacement metadata. Keep discovery metadata geometry-free;
glyph results are derived from it and do not require another provider capability. Version,
dependency and CLI-location queries keep their existing local source semantics.

[Catalogue Runtime](runtime/index.md) documents internal acceptance and query composition.
[CLI Workflow](../workflow.md) defines how hosts supply providers without an ambient registry.
