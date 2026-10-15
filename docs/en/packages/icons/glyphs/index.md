# Canonical Glyphs

Status: **Accepted**

The `glyphs` feature owns one canonical editable TypeScript module and one named immutable value
per independent icon. Each module constructs its definition through public Core and has no
collection-owned state.

## Direct imports

```ts
import { ArrowLeftOutline } from "@luscious-garden/aster-icons/arrow-left/outline";
import { SearchOutline } from "@luscious-garden/aster-icons/search/outline";
```

A direct import evaluates its minimal generated facade, the selected definition and applicable
shared authoring authorities, not sibling icons or a collection. The physical
`src/glyphs/` layout remains private; [Catalogue Source Tooling](../../../tooling/catalogue/index.md#source-convention)
owns filename, symbol and public-path validation.

Every definition declares `identity.variant`; the existing artwork explicitly uses `outline`.
Renditions of one glyph share its namespace and name. For example, an authored
`camera@stippled` rendition under namespace `aster` would export `CameraStippled` through
`@luscious-garden/aster-icons/camera/stippled`. A different concept such as `camera-retro`
remains a separate name. Stippled is a naming example, not currently distributed artwork.

## Explicit treatment migration

The old `Camera` export and `/camera` definition route are removed. Import `CameraOutline` from
`/camera/outline`; other existing icons follow the same rule. Loader and CLI identities now require
`aster/camera@outline`, not `aster/camera`. There is no default treatment or compatibility alias.
Collections remain explicit selections of concrete definitions; their aliases and ordered
`members` still expose those definitions directly. Custom Core and Import inputs, including
metadata replacement identities, must declare a treatment rather than relying on inference.

## Definition ownership

An icon retains its identity, coordinate system, ordered geometry and resolved metadata as defined
by [Core](../../core/index.md). Its module imports public Core and applicable
[authoring inputs](../authoring/index.md), never a sibling definition, collection, renderer,
manifest or Import.

Intrinsic search tags belong to the icon. Collection aliases and categories, provenance records,
review notes and computed metrics remain outside its portable definition. An icon can stand alone
or join multiple collections without gaining reverse membership or being decorated by them.

The current definitions are curated in [Amellus](../../../collections/amellus/index.md).
Its [inventory](../../../collections/amellus/inventory.md) owns the concept list, semantic order,
search vocabulary and construction coverage; its
[visual contract](../../../collections/amellus/design-contract.md) owns collection-specific
acceptance. Package discovery does not itself grant membership.

## Discovery and source maintenance

[Manifest](../manifest/index.md) exposes searchable records without evaluating artwork.
[Dynamic Loaders](../dynamic/index.md) resolves selected canonical keys to the same objects as
direct imports. Neither is a package-wide eager definition aggregate.

The [authoring workflow](../workflow.md) covers changes and review.
[Catalogue Source Tooling](../../../tooling/catalogue/index.md) regenerates facades, manifests
and loaders from canonical modules. [Quality](../quality.md) owns isolation and distribution
evidence.
