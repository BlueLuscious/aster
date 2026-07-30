# Aster Collection Authoring Workflow

Status: **Accepted**

The Experimental `aster` collection uses TypeScript-first authoring. Each distributable icon owns
one portable `Icon.define(...)` module in `@aster/icons`; SVG is a derived target and SVG+JSON
remains an optional import path for external artwork.

The workflow selection applies to this collection. It does not remove Build, prohibit SVG-first
collections, or make TypeScript source a universal Aster requirement.

## Comparison Evidence

The representative `arrow-left` workflow exercises the same identity, geometry, metadata, and
presentation policy in both directions:

```text
TypeScript definition --> @aster/svg --> deterministic review markup

SVG geometry + JSON metadata --> @aster/build --> equivalent portable definition
```

The repository workflow test verifies that both authoring paths produce the same deeply
normalised portable definition. It also verifies deterministic TypeScript-to-SVG rendering and a
correction from an off-grid visual-review finding back to the authored TypeScript geometry.

Run the complete comparison evidence with:

```sh
pnpm run test:workflow
```

The comparison produced these findings:

| Concern | TypeScript-first | SVG-first import |
| --- | --- | --- |
| Geometry editing | Explicit portable primitives and coordinates. | Natural output from vector tools, subject to the supported SVG subset. |
| Source diffs | Semantic and reviewable alongside identity. | Export formatting and tool noise require normalisation awareness. |
| Metadata | Co-located runtime metadata and presentation policy. | Separate JSON is required and must agree with acquired SVG identity. |
| Review | Deterministic SVG is rendered directly from the candidate definition. | Original SVG can be viewed directly, while the imported definition still needs derived review output. |
| Round-trip loss | SVG output omits search, lifecycle, licence, RTL, and source-authority information. | Import cannot reconstruct vector-tool masters, unsupported SVG capabilities, or discarded source formatting. |
| Automation | Requires Core and the selected review renderer. | Requires metadata decoding, parsing, safety checks, validation, normalisation, and generation. |

Neither direction is a lossless design-tool round trip. The deciding advantage for the pilot is
that TypeScript keeps the complete portable runtime authority in one reviewable module while SVG
is regenerated from exactly that accepted value.

## Canonical Module Rules

In `@aster/icons`:

- `src/icons/<icon-slug>.ts` owns an unqualified icon;
- `src/icons/<icon-slug>/<variant-slug>.ts` owns an explicit variant;
- each module contains one named immutable definition created through public `@aster/core`
  authority;
- each module imports only `@aster/core`;
- a per-icon public subpath maps to `@aster/icons/<icon-slug>`;
- variant subpaths map to `@aster/icons/<icon-slug>/<variant-slug>`;
- the package root may provide convenience re-exports without becoming a registry dependency;
- manifests remain explicit opt-in modules and never enter a per-icon graph;
- renderers, frameworks, DOM APIs, Build, filesystem APIs, and repository tooling are forbidden
  dependencies.

The pilot currently declares no variants, so its first definitions use only unqualified icon
modules.

## Metadata Rules

The canonical module owns the runtime metadata accepted by Core, including display name, RTL
policy, effective artwork licence, deprecation relationships, and collection presentation policy.

Search aliases, tags, categories, provenance, review evidence, and computed metrics remain outside
the portable runtime definition until a concrete consumer establishes their owned representation.
They cannot be hidden in generated SVG or inferred from filenames.

## Derived SVG Rules

`@aster/svg` renders review and distribution markup from the accepted definition. Derived SVG:

- is never edited as canonical geometry;
- does not replace the TypeScript module as identity or metadata authority;
- is byte-deterministic for the same definition and options;
- may be inspected in a browser or vector tool without becoming a Build dependency;
- remains ephemeral until a generated output root, cleanup owner, rebuild command, and
  verification are implemented.

No derived collection SVG is committed by the current workflow. Persistent SVG export is accepted
only with a package-owned generated boundary that can be deleted and rebuilt safely.

## Optional SVG Import

Build remains the supported domain path for converting explicitly acquired SVG geometry and JSON
metadata into portable definitions. It is appropriate for external artwork or a future
SVG-first collection, but its generated TypeScript is not the canonical source for this
TypeScript-first collection.

An imported definition enters `@aster/icons` only after a contributor deliberately adopts and
reviews the generated portable value as a canonical authored module. Subsequent corrections are
made in that module, not in Build output or derived SVG.

## Correction Loop

The accepted correction loop is:

```text
author TypeScript definition
        |
        v
construct through @aster/core
        |
        v
render deterministic SVG through @aster/svg
        |
        v
automated and curatorial review
        |
        +--> accept
        |
        +--> correct the TypeScript module and regenerate
```

Generated markup is observation evidence. It is never the location of a correction.
