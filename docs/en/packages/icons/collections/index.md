# Canonical Collections

Status: **Accepted**

The `collections` feature owns independently identified immutable collection definitions.
Membership is explicit authoring, not inferred from the package manifest or source directories.

## Consumer access

Collection exports expose explicitly selected treatment definitions:

```ts
import { Amellus } from "@luscious-garden/aster-icons/collections/amellus";

const camera = Amellus.icons.camera.outline;
const arrowLeft = Amellus.icons.arrowLeft.outline;
const orderedIcons = Amellus.members;
```

Known aliases and treatment selections retain exact readonly TypeScript keys. `members` is a
flat frozen ordered list containing the same canonical leaf objects as `icons`.
Ordinary array operations produce consumer values, not a
collection query API. [Core Collection](../../core/collection/index.md) owns alias validation,
generic output, ordering, duplicate rejection and canonical reference retention.

The import evaluates the selected collection and every declared member. Accessing one alias does
not make it lazy; use `@luscious-garden/aster-icons/camera/outline` when the collection is unnecessary.
There is no bare collection-family aggregate.

## Membership authority

Each `.collection.ts` module calls public `Collection.define()` with its own identity, metadata,
named icon imports and ordered alias dictionary. Adding a glyph does not silently add it to any
collection; removing membership does not remove or rename the independent icon.

The current authority is `Amellus`. Its
[curatorial overview](../../../collections/amellus/index.md) owns identity and provenance;
the [inventory](../../../collections/amellus/inventory.md) owns semantic order and coverage.
The canonical module's explicit dictionary remains the actual membership source.

Collection metadata describes the grouping and does not override member geometry, presentation
or artwork terms. [Authoring](../authoring/index.md) explains the independent legal inputs.

## Discovery

[Manifest](../manifest/index.md) exposes ordered member identity strings without definitions.
[Dynamic Loaders](../dynamic/index.md) resolves exact collection keys; invoking one evaluates its
complete member graph. These are distribution projections, not alternative membership sources.

[Workflow](../workflow.md) covers editing and review;
[Catalogue Source Tooling](../../../tooling/catalogue/index.md#source-convention) owns enforced
module conventions and synchronisation;
[Quality](../quality.md) owns conformance.

<a id="export-naming-migration"></a>

## Export names

Collection subpaths expose their canonical named export, such as `Amellus`. The
[manifest](../manifest/index.md) records that identifier in `CollectionManifestEntry.exportName`;
consumers use it directly rather than appending a suffix to the collection key.
[Versioned release notes](../releases/index.md#published) own published changes and migrations.
