# Canonical Collections

Status: **Experimental**

The `collections` feature owns independently identified immutable collection definitions.
`AsterCollections` is the complete immutable package index and currently contains
`AsterCollection`.

Canonical modules use `<collection-slug>.collection.ts`. Public imports omit the role and retain
`@aster/icons/collections/<collection-slug>`.

## `AsterCollection`

`AsterCollection` is constructed through public `Collection.define(...)` and retains the complete
representative pilot:

| Field | Value |
| --- | --- | --- |
| Identity | `aster` |
| Display name | Aster |
| Description | Geometric outline interface icons. |
| Tags | `interface-icons`, `outline-icons` |
| Artwork licence | ISC |
| Attribution | BlueLuscious |
| Members | The sixteen canonical pilot icon objects |

The collection does not own member geometry, presentation, licence, attribution, tags, RTL
behaviour, or lifecycle. Those values remain intrinsic to each icon. Membership neither changes
an icon nor appears in `IconIdentity`.

The same canonical icon may be retained by another collection with identical object identity.
Core rejects duplicate logical identity only within one collection.

## Imports

```ts
import { AsterCollection } from "@aster/icons/collections/aster";
```

The package root also provides the collection as a convenience. Isolated per-icon imports never
load it or any sibling icon.

`AsterCollections` supports complete package discovery without making a collection the owner of
the icon catalogue. Registering or removing a collection changes derived membership only; it does
not add or remove definitions from `AsterIcons`.

Visual rationale and enforcement severity remain canonical in the
[Aster Collection Design Contract](../../../collections/aster/design-contract.md).
