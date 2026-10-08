# Icons Quality

Status: **Accepted**

This page owns conformance evidence for authored definitions, independent collections and the
published Icons surface. [Feature guides](index.md) own behaviour;
[Quality Baseline](quality-baseline.md) owns measured imports and distribution observations.

## Evidence coverage

| Evidence | Guarantees exercised | Behaviour authority |
| --- | --- | --- |
| Authoring-authority suite | Frozen independent authorship/profile inputs, alternate visual families and independently owned artwork. | [Authoring](authoring/index.md). |
| Amellus definition suite | Profile agreement, half-unit geometry grid, primitive/command budgets, absence of node paint exceptions, frozen definitions and horizontal-arrow RTL policy. | [Amellus Visual Contract](../../collections/amellus/design-contract.md). |
| Collection suite | Source-derived alias/member agreement, metadata, canonical loader references and independent additional/reduced collections. | [Collections](collections/index.md) and [Core Collection](../core/collection/index.md). |
| Manifest suite | Exact metadata projection, canonical ordering, deep freezing, no embedded geometry, non-empty source families and effective artwork rights. | [Manifest](manifest/index.md). |
| Loader suite | Own key sets matching manifests, frozen functions, complete asynchronous resolution and stable canonical objects. | [Dynamic Loaders](dynamic/index.md). |
| Type suite | Isolated imports, concrete readonly aliases, unknown-alias rejection, manifest/loader contracts and rejected mutation. | Feature contracts and public definition subpaths. |
| Built-package ABI suite | Exact generated routes, blocked aggregates/private paths, minimal facades, direct/loader object identity, portable declarations, ESM and Core-only runtime imports. | [Package Boundary](index.md#boundary) and [Public Routes](index.md#public-routes). |
| Packed-consumer suite | Complete emitted payload with legal notices but no source/test/tooling trees, installed declaration/runtime access and native `ERR_MODULE_NOT_FOUND` when a facade is removed. | [Rights Boundary](index.md#rights-boundary) and [Distribution Costs](index.md#distribution-costs). |

The loader suites cover canonical and ordinary absent keys, not inherited property names. The
[arbitrary-key limitation](dynamic/index.md#arbitrary-key-access) remains outside their current
coverage; a passing suite is not evidence that every string lookup yields a loader or
`undefined`.

Distribution checks require effective licence and attribution for every icon and collection.
Entries declaring the original Aster artwork identifier must attribute BlueLuscious. Tests do
not grant rights to third-party work or replace the complete legal authorities.

## Source synchronisation evidence

[Catalogue Source Tooling](../../tooling/catalogue/index.md) owns deterministic discovery,
static extraction, imported authorities, relationship validation, variant mapping, generated
drift and publication safety. Its tests exercise rejected syntax and cycles without evaluating
authored modules or partially replacing existing outputs.

Package validity/discovery evidence derives families from manifests and loaders rather than a
second handwritten catalogue. Exact named assertions remain where routing or icon-owned semantics
require them. Amellus's current semantic inventory and human findings remain
[curatorial evidence](../../collections/amellus/index.md), not a generic catalogue-size promise.

## Cross-package conformance

SVG corpus tests render every distributed icon. CLI and repository workflow tests discover real
catalogue values, compare export artefacts with direct public rendering and exercise Amellus's
catalogue workflow. These tests establish interoperability, not renderer, CLI or filesystem
authority inside Icons.

The [project testing policy](../../project/testing.md) owns evidence roles and selection rules.
Curatorial approval, licensing and visual acceptance remain separate from automated validity;
benchmark timings do not establish either.
