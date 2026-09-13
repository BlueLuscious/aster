# Icons Authoring Workflow

Status: **Accepted**

`@aster/icons` uses TypeScript-first authoring. Each distributable icon owns one editable
`Icon.define(...)` module; each collection owns one explicit `Collection.define(...)` aggregate;
and SVG remains derived review or distribution output.

## Canonical flow

```text
author or correct .icon.ts
        |
        v
construct through @aster/core
        |
        +--> synchronise generated catalogue sources
        |
        +--> compose explicit .collection.ts membership
        |
        v
render or review through @aster/svg and @aster/cli
```

The TypeScript module retains geometry, portable identity, presentation and runtime metadata in
one reviewable authority. Generated barrels and aggregate indexes provide discovery but never
become editable sources. A collection references existing icon values and neither clones nor owns
their geometry.

## Canonical modules

Current icon sources use `src/icons/<icon-slug>.icon.ts` and export exactly one PascalCase constant.
Current collection sources use `src/collections/<collection-slug>.collection.ts`, export exactly
one constant ending in `Collection`, and import only public `@aster/core` plus their directly
declared icon modules. Catalogue tooling also validates the accepted nested initial-and-name source
layout without making physical directories public.

The current flat icon and collection roots remain transitional until stable generated public
facades exist. A migration baseline assigns every current icon exactly one
`src/glyphs/<initial>/<name>/<name>.icon.ts` destination and the Amellus source its independent
`src/collections/a/amellus/amellus.collection.ts` destination. Authors must not move these sources
piecemeal: package subpaths are preserved first through generated facades, then all canonical
sources move as one verified change.

Every icon module:

- creates one immutable definition through public `@aster/core`;
- composes applicable package-owned authorship and visual-profile authorities rather than copying
  shared policy;
- owns its intrinsic display name, tags, RTL policy, presentation, effective artwork licence,
  attribution, deprecation state and replacement relationship;
- remains independent from collections, renderers, Import, frameworks, DOM and filesystem APIs;
- becomes available through the package root and its isolated `@aster/icons/<icon-slug>` subpath
  after catalogue synchronisation.

The package currently has no variants. Tooling can distinguish a separate glyph such as
`camera-retro` from a `retro` rendition of `camera`, validate nested variant identity and reject
their derived-symbol collisions. Variant package subpaths remain unsupported until the public
distribution surface provides generated facades.

## Catalogue synchronisation

The package build runs the private catalogue synchroniser before TypeScript compilation. It
discovers canonical icon and collection modules recursively, validates path, identity, symbol and
membership ownership, and deterministically reconstructs the generated barrels and immutable
`AsterIcons` and `AsterCollections` indexes.

Authors add or remove a canonical module, update any explicit collection membership, and run:

```sh
pnpm --dir packages/icons run build
```

The generated outputs must never be edited manually. Their detailed ownership and drift checks
are documented by [Catalogue Source Tooling](../../tooling/catalogue/index.md).

## Derived SVG and review

`@aster/svg` renders deterministic standalone markup from an accepted definition. `aster export`
can emit one icon or plan and publish a complete collection, while `aster review` creates a
self-contained contact sheet and per-icon technical evidence. These outputs:

- are never edited as canonical geometry;
- do not replace TypeScript as identity or metadata authority;
- may be deleted and regenerated from the accepted definitions;
- remain outside package distribution unless a separate SVG distribution contract is accepted.

The correction loop always returns to the canonical module:

```text
TypeScript definition --> Core validation --> SVG rendering --> automated and visual review
          ^                                                           |
          +------------------------- correction -----------------------+
```

Automated checks establish portable validity, identity, metadata, membership, deterministic
rendering and implemented geometric constraints. Curatorial review separately evaluates
recognisability, optical balance, visual weight, negative space and collection consistency at the
documented default and minimum sizes.

## Optional source adoption

Private `@aster/import` may adopt explicitly acquired SVG into editable TypeScript when external
artwork is useful. Complete reviewed Core metadata must be supplied because SVG cannot preserve
search tags, RTL policy, lifecycle, licensing or source authority.

Once accepted into Icons, the emitted module becomes ordinary human-owned source. Later
corrections occur in that module; neither the acquired SVG nor Import remains a build or runtime
dependency. TypeScript-to-SVG and SVG-to-TypeScript are therefore controlled transformations, not
a lossless design-tool round trip.

## Acceptance evidence

Run package and cross-package evidence with:

```sh
pnpm --dir packages/icons run test
pnpm run test:workflow
```

New artwork additionally requires provenance, an effective compatible licence, attribution and
collection-specific visual acceptance. The [Icons quality contract](quality.md) owns generic
package guarantees; each [collection authority](../../collections/index.md) owns its visual rules,
inventory and curatorial evidence.
