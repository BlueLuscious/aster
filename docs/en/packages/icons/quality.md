# Icons Quality

Status: **Accepted**

This page owns conformance evidence for authored definitions, independent collections and the
public Icons surface. [Feature guides](index.md) own behaviour;
[Quality Baseline](quality-baseline.md) owns measured imports and distribution observations.

## Evidence coverage

| Evidence | Guarantees exercised | Behaviour authority |
| --- | --- | --- |
| Authoring-authority suite | Frozen independent authorship/profile inputs, alternate visual families and artwork rights retained under differently licensed curation. | [Authoring](authoring/index.md). |
| Definition suite | Explicit treatment display names; Amellus profile agreement, half-unit geometry grid, primitive/command budgets, absence of node paint exceptions, frozen definitions and horizontal-arrow RTL policy. | [Authoring](authoring/index.md) and [Amellus Visual Contract](../../collections/amellus/design-contract.md). |
| Camera treatment suite | Complementary Outline/Filled body and lens bounds, exact dictionary/loader/collection selections, uniform native circles, shared point centres, symmetry, corner counts and spacing/overlap bounds. | [Camera treatments](glyphs/index.md#camera-treatments). |
| Collection suite | Sole canonical export, facade/loader object identity, source-derived alias/member agreement, metadata and independent additional/reduced collections. | [Collections](collections/index.md) and [Core Collection](../core/collection/index.md). |
| Manifest suite | Exact metadata projection, canonical ordering, deep freezing, no embedded geometry, non-empty source families and effective artwork rights. | [Manifest](manifest/index.md). |
| Loader suite | Own key sets matching manifests, frozen functions, concurrent resolution retaining canonical leaves, and inherited-name absence. | [Dynamic Loaders](dynamic/index.md#arbitrary-key-access). |
| Type suite | Isolated imports, exact readonly glyph keys, rejected dictionary-as-definition use and undeclared exports, concrete readonly aliases, manifest/loader contracts and rejected mutation. | Feature contracts and public definition subpaths. |
| Built-package ABI suite | Exact generated routes, blocked aggregates/private paths, minimal facades, direct/loader object identity, inherited-name absence, portable declarations, ESM, Core-only runtime imports and exact fresh-process evaluation sets. | [Package Boundary](index.md#boundary), [Public Routes](index.md#public-routes) and [Dynamic Loaders](dynamic/index.md#arbitrary-key-access). |
| Packed-consumer suite | Complete emitted payload with legal notices but no source/test/tooling trees, installed declaration/runtime access, sole canonical collection export, undeclared-export rejection in declarations and native ESM, inherited-name absence, direct canonical loader targets sharing public facade objects and native `ERR_MODULE_NOT_FOUND` details on missing definition modules. | [Rights Boundary](index.md#rights-boundary), [Distribution Costs](index.md#distribution-costs) and [Dynamic Loaders](dynamic/index.md). |

Distribution checks require effective licence and attribution for every icon and collection.
Entries declaring the original Aster artwork identifier must attribute BlueLuscious. Tests do
not grant rights to third-party work or replace the complete legal authorities.

## Source synchronisation evidence

[Catalogue Source Tooling](../../tooling/catalogue/index.md) owns deterministic discovery,
static extraction, imported authorities, relationship validation, variant mapping, generated
drift and publication safety. Its tests exercise rejected syntax and cycles without evaluating
authored modules or partially replacing existing outputs. A generated-output fixture also
preserves valid own `constructor` keys for both loader families, without an inherited fallback.
Compiled multi-treatment fixtures prove individual-versus-dictionary native evaluation and exact
own-data keys; packed consumers verify every distributed dictionary/leaf/collection/loader
reference and ordered member rendering. Native ESM enforces each facade's declared exports rather
than treating a glyph dictionary as a concrete definition.

A compiler regression fixture checks generated metadata for 10,000 definitions against the actual
public manifest and Core declaration contracts. It prevents literal-union inference failure; it
is not a timing test or evidence that an entire 10,000-definition package builds within a budget.

Identity projections ignore inherited namespace and treatment values. Source inspection rejects
non-canonical declared namespaces before replacing any output; namespace absence stays distinct
from an explicitly owned namespace in both glyph dictionaries and collection groups.

Package validity/discovery evidence derives families from manifests and loaders rather than a
second handwritten catalogue. Exact named assertions remain where routing or icon-owned semantics
require them. Amellus's current semantic inventory and human findings remain
[curatorial evidence](../../collections/amellus/index.md), not a generic catalogue-size promise.

## Cross-package conformance

SVG corpus tests render every distributed icon. CLI and repository workflow tests discover real
catalogue values, compare export artefacts with direct public rendering and exercise Amellus's
catalogue workflow with canonical provider references, exact metadata and ordered member identities.
The Camera workflow checks all four treatments through metadata-only glyph/icon discovery,
selective memberships, exact Export/Review markup and deterministic size/colour rendering.
It keeps independent point treatments discoverable without adding them to Amellus's review.
These tests establish interoperability, not renderer, CLI or filesystem
authority inside Icons.

The [project testing policy](../../project/testing.md) owns evidence roles and selection rules.
Curatorial approval, licensing and visual acceptance remain separate from automated validity;
benchmark timings do not establish either.
