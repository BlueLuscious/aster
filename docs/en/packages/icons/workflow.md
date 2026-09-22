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
one reviewable authority. Generated manifests, loader maps and public facades provide distribution
or discovery but never become editable sources. A collection references existing
icon values and neither clones nor owns their geometry.

## Canonical modules

Icon sources use `src/glyphs/<initial>/<name>/<name>.icon.ts` and export exactly one PascalCase
constant. Collection sources use
`src/collections/<initial>/<name>/<name>.collection.ts`, export exactly one constant ending in
`Collection`, and import only public `@aster/core`, their directly declared icon modules and any
applicable local artwork-licence authority.
Generated facades keep these physical directories private and preserve logical public subpaths.
The generated distribution manifest and dynamic loader maps derive discovery and resolution
records from the same modules.

Every icon module:

- creates one immutable definition through public `@aster/core`;
- composes applicable package-owned authorship and visual-profile authorities rather than copying
  shared policy;
- owns its intrinsic display name, tags, RTL policy, presentation, effective artwork licence,
  attribution, deprecation state and replacement relationship;
- remains independent from collections, renderers, Import, frameworks, DOM and filesystem APIs;
- becomes available through its isolated `@aster/icons/<icon-slug>` subpath after catalogue
  synchronisation.

The package currently has no variants. Tooling distinguishes a separate glyph such as
`camera-retro` from a `retro` rendition of `camera` and validates nested variant identity.
Distinct public subpaths may expose the same derived symbol because no aggregate barrel combines
their module scopes. Generated facades support variant package subpaths without making the nested
canonical source path public.

## Authoring procedures

### Add a base icon

Create a distributable base icon at
`src/glyphs/<initial>/<name>/<name>.icon.ts`; synchronisation generates its stable public facade.
To add one:

1. choose a canonical lowercase kebab-case glyph name and export its PascalCase symbol;
2. call `Icon.define(...)` with complete identity, view box, nodes and metadata;
3. compose the applicable authorship and visual profile explicitly, including effective artwork
   licence and attribution;
4. add the imported definition to each intended collection's explicit `icons` sequence;
5. run the package build, inspect `aster review` evidence and run complete verification.

Omitting step 4 leaves a valid standalone icon. No generated manifest, loader map, facade or test
inventory is edited manually.

### Add a collection

A new distributable collection lives at
`src/collections/<initial>/<name>/<name>.collection.ts` behind a generated public facade. It
exports `<Name>Collection`, imports each member from its canonical icon module, declares
collection-owned metadata and retains members in its intentional semantic order. Catalogue
synchronisation discovers it automatically; authors do not edit distribution manifests, loader
maps or public facades.

## Artwork rights

Every distributable icon and collection declares its effective artwork licence and attribution in
its own metadata. The [Aster Artwork Licence](../../../../packages/icons/ARTWORK-LICENCE.md) is
the normal choice for original visual artwork authored and owned by BlueLuscious; it is not
assigned merely because a definition lives in this package or uses the `aster` namespace. Each
BlueLuscious-owned definition opts in explicitly through `LicenseRef-Aster-Artwork-1.0`.
Third-party or differently licensed work keeps its own licence, attribution and reviewed source
provenance. A collection's licence applies to its own original curation, not automatically to the
artwork of every member icon. Software and documentation remain under the
[ISC notice](../../../../packages/icons/LICENSE).

### Add a rendition

The accepted rendition source is
`src/glyphs/<initial>/<name>/<name>-<variant>.icon.ts`, sharing the base glyph `name` and declaring
the rendition in `identity.variant`. Its stable public path is
`@aster/icons/<name>/<variant>`. Recursive tooling and generated facades enforce this identity,
symbol and public-path mapping.

## Catalogue synchronisation

The package build runs the private catalogue synchroniser before TypeScript compilation. It
discovers canonical icon and collection modules recursively, validates path, identity, symbol,
static manifest metadata and membership ownership, and deterministically reconstructs the
metadata-only manifest, exact dynamic loader maps and isolated public facades.

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
