# Collection and Source Boundary

Status: **Accepted**

This document separates canonical TypeScript definitions, optional external sources, collections,
and host effects.

## Canonical authoring

Aster is TypeScript-first. Canonical icon modules use `<icon-slug>.icon.ts`; canonical collection
modules use `<collection-slug>.collection.ts`. SVG rendered by `@aster/svg` is derived output.

## External sources

`@aster/import` accepts already acquired and decoded source values. The current built-in format is
SVG. Import does not require a repository source root, metadata directory, filename convention,
Illustrator master, collection manifest, or filesystem host.

A host may choose any storage layout and may use vector-tool masters, but only the explicit source
value crosses the Import boundary. Source identity is logical diagnostic provenance, not a path
from which Import discovers authority.

## Metadata relationship

SVG contributes geometry and supported presentation only. Complete icon metadata is supplied
separately as a reviewed Core value during adoption. Import rejects source and metadata identities
that disagree; it does not decode JSON metadata or derive collection membership.

## Collection relationship

An icon exists independently from collections. A collection may retain zero or more icons, and an
icon may belong to zero or more collections. Collection-scale import is host composition over an
explicit atomic batch, followed by deliberate `Collection.define(...)` authoring.

## Host boundary

Hosts own source discovery, filesystem or network reads, text decoding, metadata acquisition,
persistence, overwrite decisions, terminal output, and process exit state. Import owns none of
those effects.

## Editable output

An emitted `.icon.ts` module becomes human-owned source immediately. It is not regenerated or
cleaned by Import and does not claim to recreate an Illustrator or other design-tool master.
