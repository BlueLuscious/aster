# Aster Collection Authoring Workflow

Status: **Accepted**

The Experimental `aster` collection uses TypeScript-first authoring. Each distributable icon owns
one portable `Icon.define(...)` module in `@aster/icons`; SVG is a derived target and explicit SVG
adoption remains an optional path for external artwork.

The workflow selection applies to this collection. It does not remove Import, prohibit SVG-first
collections, or make TypeScript source a universal Aster requirement.

## Comparison Evidence

The representative `arrow-left` workflow exercises the same identity, geometry, metadata, and
presentation policy in both directions:

```text
TypeScript definition --> @aster/svg --> deterministic review markup

SVG geometry + reviewed Core metadata --> @aster/import --> editable portable definition
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
| Metadata | Co-located runtime metadata and presentation policy. | Complete reviewed Core metadata is supplied explicitly during adoption. |
| Review | Deterministic SVG is rendered directly from the candidate definition. | Original SVG can be viewed directly, while the imported definition still needs derived review output. |
| Round-trip loss | SVG output omits search, lifecycle, licence, RTL, and source-authority information. | Import cannot reconstruct vector-tool masters, unsupported SVG capabilities, or discarded source formatting. |
| Automation | Requires Core and the selected review renderer. | Requires parsing, safety checks, validation, normalisation, definition construction, and editable module emission. |

Neither direction is a lossless design-tool round trip. The deciding advantage for the pilot is
that TypeScript keeps the complete portable runtime authority in one reviewable module while SVG
is regenerated from exactly that accepted value.

## Canonical Module Rules

In `@aster/icons`:

- `src/icons/<icon-slug>.icon.ts` owns an unqualified icon;
- `src/icons/<icon-slug>/<variant-slug>.icon.ts` owns an explicit variant;
- each module contains one named immutable definition created through public `@aster/core`
  authority;
- each module imports only public `@aster/core` and package-owned icon-authoring defaults;
- a per-icon public subpath maps to `@aster/icons/<icon-slug>`;
- variant subpaths map to `@aster/icons/<icon-slug>/<variant-slug>`;
- the package root may provide convenience re-exports without becoming a registry dependency;
- collection definitions and manifests remain explicit opt-in modules and never enter a per-icon
  graph;
- renderers, frameworks, DOM APIs, Import, filesystem APIs, and repository tooling are forbidden
  dependencies.

The pilot currently declares no variants, so its first definitions use only unqualified icon
modules.

## Metadata Rules

The canonical module owns the runtime metadata accepted by Core, including display name,
intrinsic tags, RTL policy, effective artwork licence, deprecation relationships, and icon
presentation policy.

Search aliases, collection-specific categories, provenance, review evidence, computed metrics, and
indexes remain outside the portable runtime definition until a concrete consumer establishes
their owned representation. They cannot be hidden in generated SVG or inferred from filenames.

The canonical `AsterCollection` retains accepted icon values separately. An icon remains valid
without that membership and can be retained by additional collections without mutation.

## Derived SVG Rules

`@aster/svg` renders review and distribution markup from the accepted definition. Derived SVG:

- is never edited as canonical geometry;
- does not replace the TypeScript module as identity or metadata authority;
- is byte-deterministic for the same definition and options;
- may be inspected in a browser or vector tool without becoming an Import dependency;
- remains disposable review evidence outside package distribution.

No derived collection SVG is committed by the current workflow. Persistent SVG distribution has
an implemented `aster export` boundary that can return a headless plan, write one icon to stdout,
or publish a complete collection beneath an explicit absent output root. Exported SVG remains
derived and disposable rather than canonical collection source. Reproducible contact-sheet and
visual-review composition remains deferred to `aster review`; that future command must own its
outputs without moving filesystem authority into Icons, Core, or SVG.

## Optional SVG Import

Import remains the supported domain path for adopting explicitly acquired SVG geometry with
complete reviewed Core metadata into portable definitions. It is appropriate for external artwork
or a future SVG-first collection, but the emitted TypeScript has no generated lifecycle: once
accepted, it becomes a human-owned editable module.

An imported definition enters `@aster/icons` only after a contributor deliberately reviews and
accepts the adopted portable value as a canonical authored module. Subsequent corrections are made
in that module rather than in the acquired source or derived SVG.

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

## Review and acceptance

One collection change is reviewed through distinct evidence layers:

1. Package and workflow checks validate portable structure, identity, shared presentation,
   membership, deterministic rendering and implemented geometric constraints.
2. Geometric guidance identifies safe-area, complexity and optical questions without pretending
   every visual exception is a programming failure.
3. Human review compares reference icons, semantic neighbours and output at `16px` and `24px` for
   recognisability, balance, weight, consistency and technical cleanliness.
4. The named curator accepts the resulting icon and any explicit collection exception.

A geometry change records before-and-after visual evidence at representative sizes. New artwork
also records provenance and effective licence. An exception identifies the icon, affected rule,
visual reason, evidence, curator and whether repetition should change the design contract.
