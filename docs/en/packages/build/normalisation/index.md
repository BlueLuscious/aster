# Build SVG Normalisation

Status: **Accepted**

The normalisation feature converts successful SVG validation evidence and structured authored
metadata into canonical portable icon definitions. It is internal to `@aster/build`; none of its
contracts, classes, or intermediate values are exported from the package root.

Normalisation owns representation only. It cannot repair rejected source, infer artwork intent,
or weaken validation authority.

## Input boundary

`ISvgNormalisationRequest` combines:

- one `ISvgValidationEvidence` proving that no blocking SVG diagnostic exists;
- one structured `ICollectionMetadataValue` linked to the accepted collection metadata source by
  exact `sourceId`;
- one structured `IIconMetadataValue` for every accepted icon metadata source, also linked by exact
  `sourceId` and complete `IconIdentity`.

The structured values are the domain output expected from a replaceable metadata decoder. They do
not select JSON, YAML, TypeScript, or another textual serialisation. Text acquisition and identity
validation remain separate from decoding so a parser technology cannot leak into Core.

Because the request requires successful validation evidence rather than a diagnostic result,
blocking diagnostics have no representable route into normalisation and no partial output is
created.

## Internal contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `ISvgNormaliser` | Converts one complete accepted request into canonically ordered portable definitions. | Implemented by `SvgNormaliser`; returns Core `IconDefinition` values. |
| `ISvgNormalisationRequest` | Groups successful validation evidence with linked structured metadata. | Input to `ISvgNormaliser`. |
| `ICollectionMetadataValue` | Carries selected-collection import defaults and icon licence override authority. | Linked to `CollectionMetadataSource`; consumed by `IconMetadataComposer`. |
| `IIconMetadataValue` | Carries runtime-relevant icon-authored metadata and complete identity. | Linked to `IconMetadataSource`; consumed by `IconMetadataComposer`. |

## Runtime responsibilities

| Class | Responsibility |
| --- | --- |
| `SvgNormaliser` | Validates evidence-to-metadata links, preserves canonical identity order, flattens structural syntax, and delegates final construction to Core. |
| `SvgPresentationNormaliser` | Resolves accepted root and group inheritance and canonicalises portable presentation fields. |
| `SvgPrimitiveNormaliser` | Maps every accepted primitive to the corresponding explicit Core node without converting it to a path. |
| `SvgPathDataNormaliser` | Produces deterministic command and number spacing while preserving command case and geometry. |
| `IconMetadataComposer` | Resolves selected-collection import defaults and permitted icon-authored licensing overrides into icon-owned metadata. |

## Geometry and presentation

The root `svg` and structural `g` elements do not become portable nodes. Their accepted inherited
presentation is carried to descendant primitives while child values override the same field.
Primitive order is the exact depth-first source paint order.

The feature preserves `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, and `polygon` kinds.
It resolves SVG numeric defaults, converts point sequences into explicit coordinate pairs,
normalises negative zero, expands short hexadecimal paint, and canonicalises path token spelling.
Rectangle radii apply SVG's missing-counterpart rule: an authored `rx` supplies an absent `ry` and
vice versa.

Strict finite numbers, number sequences, path commands, parameter arity, separators, and canonical
path token spelling come from [Build Shared Authorities](../shared/index.md). Validation decides
whether lexical failures block evidence; Normalisation reuses the same stateless services only
after successful evidence exists. This keeps one grammar authority without coupling
Normalisation to Validation runtime implementations.

Overall `opacity` on `svg` or `g` is rejected by validation. Flattening it onto each child would
change compositing semantics when geometry overlaps. Fill opacity, stroke opacity, and the other
accepted inheritable presentation fields can be resolved without that loss.

Namespace declarations, the root viewBox attribute, and structural groups are validated source
syntax and do not enter portable nodes. Unknown editor metadata is rejected before this boundary
rather than silently retained or discarded.

## Metadata composition

Collection metadata supplies the portable presentation policy, default artwork licence, and
default attribution. Icon metadata supplies display name, RTL policy, deprecation relationship,
and optional icon-specific licensing values.

An icon-specific licence is accepted only when
`ICollectionMetadataValue.allowIconLicenceOverride` grants that authority. Icon attribution takes
precedence when supplied. When an icon replaces the collection licence without supplying
attribution, attribution tied to the previous licence is not retained.

Repository-only discovery, provenance, and review metadata do not enter an `IconDefinition`.

## Core construction

`SvgNormaliser` submits every composed value through the public `@aster/core` `Icon.define()` API.
Core therefore remains authoritative for exact fields, deep isolation, canonical presentation,
metadata invariants, and immutability. Build never imports private Core implementation modules.

Golden fixtures cover every accepted primitive kind, inherited presentation, lexical numeric and
colour equivalence, path idempotence, metadata ownership, byte-equivalent serialisation, and
re-acceptance by Core.
