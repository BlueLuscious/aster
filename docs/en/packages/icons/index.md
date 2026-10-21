# @luscious-garden/aster-icons

Status: **Accepted**

`@luscious-garden/aster-icons` distributes canonical portable icon definitions, independently
authored collections, metadata-only discovery and exact asynchronous loaders. It has no
package-wide definition root or ambient registry.

## Boundary

The package depends only on public Core. It emits native ES2022 ESM with `sideEffects: false`
and host-independent declarations. It neither renders nor imports SVG, and has no DOM,
filesystem, framework or repository-tooling runtime authority.

Canonical TypeScript modules own definitions and explicit membership. Generated facades,
manifest records and loaders project those sources; they are not editable authoring authorities.
[Catalogue Source Tooling](../../tooling/catalogue/index.md) owns their reconstruction.

## Public routes

| Route | Purpose and owner |
| --- | --- |
| `@luscious-garden/aster-icons/<name>` | One exact eager dictionary of the glyph's treatments; [Glyphs](glyphs/index.md#glyph-dictionaries). |
| `@luscious-garden/aster-icons/<name>/<variant>` | One concrete treatment definition; [Glyphs](glyphs/index.md). |
| `@luscious-garden/aster-icons/collections/<name>` | One collection and its declared members; [Collections](collections/index.md). |
| `@luscious-garden/aster-icons/manifest` | Lightweight discovery records; [Manifest](manifest/index.md). |
| `@luscious-garden/aster-icons/dynamic` | Deferred resolution by canonical key; [Dynamic Loaders](dynamic/index.md). |

The package root and bare `/collections` aggregate are explicitly blocked. Generated and physical
implementation subpaths are not public. The current corpus declares every existing treatment as
`outline`. Routes and dictionary keys exist only for authored glyphs and treatments; export
patterns do not create missing artwork.

## Rights boundary

The [ISC software notice](../../../../packages/icons/LICENSE) and
[Aster Artwork Licence](../../../../packages/icons/ARTWORK-LICENCE.md) govern different material.
Artwork metadata identifies the effective terms for geometry and collection curation; software
licensing is not inferred from that field or from a `.icon.ts` extension. Inclusion in this
package alone does not assign original Aster terms to other artwork.

Use the complete legal authorities above for permissions and redistribution obligations.
[Authoring](authoring/index.md) explains resolved legal metadata; each
[collection authority](../../collections/index.md) owns provenance and curatorial acceptance.

## Distribution costs

| Concern | Boundary |
| --- | --- |
| npm acquisition | Installation acquires the complete published package, even when one icon is imported. |
| Runtime evaluation | A direct icon evaluates its facade, definition and shared authorities. A glyph dictionary evaluates all its distributed treatments; a collection evaluates every declared member. Manifest and loader-map imports evaluate no complete definitions. |
| Bundle inclusion | Isolated subpaths and deferred imports support module/chunk separation; final inclusion depends on the bundler and application. |

Prefer a direct subpath for known artwork. Use the manifest for discovery and loader maps for
runtime-selected definitions. Neither changes acquisition. Measured module sets and current
distribution sizes belong to [Quality Baseline](quality-baseline.md), not a bundle-size promise.

## Documentation

[Authoring](authoring/index.md) owns internal shared inputs;
[Workflow](workflow.md) owns editing and review hand-offs;
[Quality](quality.md) owns conformance evidence;
[Amellus](../../collections/amellus/index.md) owns the current collection's visual authority.
[Releases](releases/index.md) owns published changes and migrations. The
[package dependency graph](../index.md) and
[publication procedure](../../project/publication.md) own cross-package relationships and approval.
