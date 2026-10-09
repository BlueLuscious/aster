# Canonical Collections

Status: **Accepted**

The `collections` feature owns independently identified immutable collection definitions.
Membership is explicit authoring, not inferred from the package manifest or source directories.

## Consumer access

The following example describes the source-tree API. See the
[export-naming migration](#export-naming-migration) for published-version availability.

```ts
import { Amellus } from "@luscious-garden/aster-icons/collections/amellus";

const camera = Amellus.icons.camera;
const arrowLeft = Amellus.icons.arrowLeft;
const orderedIcons = Amellus.members;
```

Known aliases retain exact readonly TypeScript keys. `members` is a frozen ordered list containing
the same canonical objects as `icons`. Ordinary array operations produce consumer values, not a
collection query API. [Core Collection](../../core/collection/index.md) owns alias validation,
generic output, ordering, duplicate rejection and canonical reference retention.

The import evaluates the selected collection and every declared member. Accessing one alias does
not make it lazy; use `@luscious-garden/aster-icons/camera` when the collection is unnecessary.
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

## Export-naming migration

**Breaking change; not yet released.** The source-tree API removes the role suffix from
collection value exports. Existing [published versions](../releases/index.md) retain their
original exports; this guide does not announce a new package version.

Keep the public subpath and replace the named import and its references:

```ts
// Before
import { AmellusCollection } from "@luscious-garden/aster-icons/collections/amellus";

// After
import { Amellus } from "@luscious-garden/aster-icons/collections/amellus";
```

The old export is absent, with no compatibility alias. The Amellus
`CollectionManifestEntry.symbol` also changes from `"AmellusCollection"` to `"Amellus"`;
manifest-driven consumers must use the record's symbol, not append a suffix to its key.

The `amellus` identity and loader key, public route, readonly icon aliases, member order, metadata,
immutability and direct/loader object identity are unchanged. Core's `Collection.define` and
collection contracts keep their domain names. This is a breaking export and manifest change
under the [versioning policy](../../../project/versioning.md#compatibility-before-10), not a
compatible patch or a change to collection membership.
