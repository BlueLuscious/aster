# Metadata and Identity Boundary

Status: **Accepted**

This document defines metadata ownership, composition, identity, naming, lifecycle relationships,
and licensing resolution without selecting a serialization or schema-validation technology.

Geometry is not metadata. Portable geometry originates in canonical SVG and becomes nodes through
the accepted build pipeline.

## Metadata layers

Aster composes metadata from three distinct layers:

| Layer | Ownership | Examples |
| --- | --- | --- |
| Collection-authored metadata | Collection curator | Collection identity, status, license defaults, supported variants, and presentation defaults. |
| Icon-authored metadata | Icon contributor and curator | Display name, aliases, tags, category, author override, license override, RTL policy, and deprecation relationship. |
| Generated technical metadata | Build pipeline | Computed bounds, primitive counts, source digest, normalized identity, and release-derived fields. |

Project-wide technical invariants are not metadata defaults and cannot be overridden by a
collection or icon.

Composition follows this authority:

1. Project invariants validate every input.
2. Collection metadata supplies declared defaults.
3. Icon metadata supplies only fields that the collection allows icons to override.
4. Generated technical facts are authoritative for computed fields and cannot be authored.

The resulting portable definition retains only metadata required by runtime consumers. Build,
review, source-provenance, and repository-only fields remain outside the runtime definition unless
a concrete public consumer requires them.

## Collection metadata draft

The conceptual collection fields are:

| Field | Requirement | Meaning |
| --- | --- | --- |
| `name` | Required | Human-readable collection name. |
| `slug` | Required | Stable ASCII lowercase `kebab-case` identity. |
| `status` | Required | Experimental, Active, Deprecated, or Archived lifecycle. |
| `description` | Optional | Concise purpose and visual positioning. |
| `curator` | Required for Active | Person or group responsible for visual approval. |
| `license` | Required for distribution | Default effective license identifier. |
| `attribution` | Conditional | Attribution text or reference required by the effective license. |
| `defaultSize` | Optional | Collection presentation default validated by representative icons. |
| `minimumSize` | Optional | Smallest curator-approved display size. |
| `variants` | Optional | Declared controlled variations supported by the collection. |
| `deprecated` | Derived from status | Indicates retirement intent without deleting identity. |
| `replacedBy` | Optional | Fully qualified replacement collection identity. |

Detailed grid, stroke, safe-area, construction, and optical rules belong in the collection design
contract. Runtime metadata retains only presentation defaults needed by renderers.

## Icon metadata draft

The conceptual icon fields are:

| Field | Requirement | Meaning |
| --- | --- | --- |
| `name` | Required | Stable canonical icon slug within its collection and optional variant. |
| `displayName` | Required | Human-readable name for documentation and search. |
| `aliases` | Defaults to empty | Alternative search terms that do not create export identity. |
| `tags` | Defaults to empty | Descriptive search and discovery terms. |
| `category` | Optional | One accepted taxonomy value when a collection uses categories. |
| `author` | Optional | Icon-specific author overriding or supplementing collection authorship. |
| `license` | Optional | Icon-specific distribution license allowed by the collection. |
| `attribution` | Conditional | Icon-specific attribution required by its effective license. |
| `variant` | Optional | Controlled variation identity within the collection. |
| `rtl` | Defaults to Preserve | Mirror, Preserve, or Manual directional behavior. |
| `deprecated` | Defaults to false | Indicates that consumers should migrate away from this identity. |
| `replacedBy` | Optional | Fully qualified replacement icon identity. |
| `introducedIn` | Generated at release | First released collection or package version containing the icon. |

Metadata may gain fields when a real build, renderer, search, documentation, licensing, or
governance consumer exists. Fields are not added solely because they might be useful eventually.

## Canonical identity

One logical icon identity is:

```text
collection-slug / icon-slug / optional-variant-slug
```

Collection and icon slugs are stable ASCII lowercase `kebab-case`. Variant slugs follow the same
rule when variants have separate logical identity.

This logical identity is independent from:

- display name;
- generated TypeScript symbol;
- source file extension;
- target renderer or framework;
- package layout or export path;
- aliases, tags, and categories.

Whether variants are embedded in one definition, represented as separate definitions, or
distributed through entry points remains Open. Every model must preserve the same unambiguous
logical identity.

Duplicate logical identity within one generation unit is an error. Diagnostic names, display
names, aliases, and object shape never substitute for canonical identity.

## Naming relationships

Naming has separate audiences:

| Name | Form | Authority |
| --- | --- | --- |
| Collection slug | `minimal` | Stable collection identity and directory name. |
| Icon slug | `arrow-left` | Stable icon identity and canonical SVG base filename. |
| Display name | `Arrow Left` | Human-readable documentation and search label. |
| Generated symbol | `ArrowLeft` | Deterministically derived TypeScript definition symbol. |
| Generated named wrapper | `ArrowLeftIcon` | Deterministically derived target-renderer symbol. |
| Alias | `back` | Search-only alternative, never an import identity. |

Generated-name collisions are errors even when canonical slugs differ. Reserved JavaScript words,
case folding, punctuation removal, and wrapper suffixes must be considered by generation
validation.

Aliases and tags are normalized for search but do not redirect imports. Category taxonomy remains
Open until a collection or catalog consumer demonstrates the required hierarchy.

## Deprecation and replacement

Deprecation preserves identity and distribution history. It does not remove an icon or collection
silently.

A replacement:

- uses a fully qualified logical identity;
- cannot point to itself;
- cannot create a replacement cycle;
- must preserve a diagnostic when its target is unavailable in the current generation unit;
- may cross collections only through an explicit curatorial decision.

`replacedBy` remains optional because some deprecated symbols have no direct replacement.
Generated documentation and declarations expose deprecation according to the accepted distribution
contract.

## RTL metadata

Directional behavior is portable metadata:

| Value | Meaning |
| --- | --- |
| Mirror | A target adapter mirrors the icon in right-to-left context. |
| Preserve | The icon keeps its original geometry in every text direction. |
| Manual | The consumer or semantic UI layer selects directional behavior explicitly. |

Core stores the policy but does not read browser direction, apply transforms, or infer semantics
from the icon name.

## License resolution

Effective icon licensing resolves in this order:

1. An allowed icon-specific license and attribution.
2. The collection default license and attribution.

Project software licensing does not fill missing artwork licensing. Distribution fails when an
effective artwork license or required attribution cannot be resolved.

Generated definitions may retain the effective license identifier when runtime or redistribution
consumers require it. Full legal text and repository policy remain outside each icon definition.

## Technology boundary

Metadata serialization format, file extension, schema library, and authoring UI remain Open.
Whichever technology is selected must:

- preserve the accepted field meanings and authority layers;
- produce deterministic validation diagnostics;
- support authored defaults and generated facts without mixing ownership;
- avoid framework, DOM, browser, and Lotus types;
- remain replaceable behind Aster-owned metadata contracts.

