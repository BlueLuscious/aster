# Canonical Collections

Status: **Accepted**

The `collections` feature owns independently identified immutable collection definitions. The
collection manifest provides complete discovery and exact loaders resolve selected definitions.
The accepted concrete authority is currently `AmellusCollection`.

Canonical modules use `<collection-slug>.collection.ts`. Public imports omit the role and retain
`@luscious-garden/aster-icons/collections/<collection-slug>`.

## `AmellusCollection`

`AmellusCollection` is constructed through public `Collection.define(...)` and explicitly retains
the complete twenty-six-icon foundational inventory in accepted semantic order:

| Field | Value |
| --- | --- |
| Identity | `amellus` |
| Display name | Amellus |
| Description | Minimalist general-purpose outline icons for application interfaces. |
| Tags | `application-icons`, `general-purpose`, `interface-icons`, `minimalist`, `outline-icons` |
| Artwork licence | `LicenseRef-Aster-Artwork-1.0` ([terms](../../../../../packages/icons/ARTWORK-LICENCE.md)) |
| Attribution | BlueLuscious |
| Members | All twenty-six canonical foundational icon objects |

The explicit `icons` alias dictionary is curated independently from the icon manifest. Its own
property order defines the frozen `members` list derived by Core. Adding another canonical icon
to the package therefore does not silently add it to Amellus. The same canonical icon may later be
retained by another collection with identical object identity and without acquiring a mutable
reverse membership link. Core rejects duplicate logical identity only within one collection.

## Imports

```ts
import { AmellusCollection } from "@luscious-garden/aster-icons/collections/amellus";

const camera = AmellusCollection.icons.camera;
const arrowLeft = AmellusCollection.icons.arrowLeft;
const orderedIcons = AmellusCollection.members;
```

The isolated subpath loads only the selected collection and its declared icon members. Complete
collection discovery uses `@luscious-garden/aster-icons/manifest`; runtime identity selection uses
`@luscious-garden/aster-icons/dynamic`. The package does not export a bare collection-family aggregate.

Known aliases retain exact TypeScript keys and readonly properties. `members` is the ordered
frozen list, so ordinary `map`, `find`, `filter`, and iteration operate on it. These array operations
produce ordinary consumer values; the collection itself has no query or mutation methods.

Access through `.icons.camera` does not make a collection import lazy. That import evaluates all
declared members; use `@luscious-garden/aster-icons/camera` when only Camera is needed. The
[Core Collection contract](../../core/collection/index.md) owns alias validation, canonical
identity independence, order, and reference-retention guarantees.

Collection membership remains explicitly authored. Changing a collection changes its derived
membership record only and does not add or remove independent icon definitions.

Visual rationale and enforcement severity remain canonical in the
[Amellus Visual Design Contract](../../../collections/amellus/design-contract.md).
