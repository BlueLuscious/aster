# Metadata and Identity Boundary

Status: **Accepted**

This document defines portable metadata, canonical identity, collection membership, and source
adoption authority. Geometry and metadata remain separate responsibilities.

## Portable metadata

`@aster/core` owns the public `IconMetadata` contract and validates complete metadata during
`Icon.define(...)`. Metadata includes stable identity, display information, intrinsic tags,
licensing, direction policy, and lifecycle relationships required by portable consumers.

Repository review evidence, parser facts, source provenance, catalogue indexes, aliases that do
not form portable identity, and collection-specific taxonomy remain outside an icon definition
unless a concrete public consumer requires them.

## Canonical identity

One logical icon identity is:

```text
optional-namespace / icon-slug / optional-variant-slug
```

Identity is independent from display name, source filename, TypeScript symbol, renderer, package
layout, catalogue, and collection membership. One icon may be standalone or retained by several
collections without changing its identity.

## Collection membership

A `CollectionDefinition` owns its identity, metadata, and explicit retained icons. An icon does not
own reverse membership. Collection defaults do not mutate an icon definition, and Import does not
create collection policy implicitly.

## Adoption metadata

External source inspection returns a metadata-free draft. The host must supply complete reviewed
Core metadata when calling `IconImport.define(...)` or `IconImport.adopt(...)`. Import has no
textual metadata decoder and does not infer metadata from SVG, filenames, directories, or
collection context.

This boundary keeps external source formats replaceable and preserves Core as the only definition
and metadata validity authority. See [Import Adoption](../packages/import/adoption/index.md).

## Naming

Canonical slugs use stable ASCII lowercase `kebab-case`. TypeScript symbols are deterministic
serialisation concerns and never replace canonical identity. Naming collisions within one atomic
adoption batch are blocking diagnostics.

## Direction and lifecycle

RTL policy is portable metadata interpreted only by compatible targets. Core does not inspect DOM
direction or infer semantics. Deprecation preserves identity; replacement identities cannot point
to themselves or form invalid relationships accepted by Core.

## Licensing

Every distributable icon requires explicit artwork licensing accepted by Core. Repository software
licensing does not fill missing artwork authority. Collection and product documentation may add
curatorial context without becoming runtime metadata.
