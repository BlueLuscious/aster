# Canonical Collections

Status: **Experimental**

The `collections` feature owns independently identified immutable collection definitions.
`AsterCollections` is the complete immutable package index and currently contains
`AmellusCollection` and `AsterCollection` in canonical identity order.

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
| Members | The seven retained canonical pilot icon objects |

The collection does not own member geometry, presentation, licence, attribution, tags, RTL
behaviour, or lifecycle. Those values remain intrinsic to each icon. Membership neither changes
an icon nor appears in `IconIdentity`.

The same canonical icon may be retained by another collection with identical object identity.
Core rejects duplicate logical identity only within one collection.

## `AmellusCollection`

`AmellusCollection` is constructed through public `Collection.define(...)` and explicitly retains
the complete twenty-six-icon foundational inventory in accepted semantic order:

| Field | Value |
| --- | --- |
| Identity | `amellus` |
| Display name | Amellus |
| Description | Minimalist general-purpose outline icons for application interfaces. |
| Tags | `application-icons`, `general-purpose`, `interface-icons`, `minimalist`, `outline-icons` |
| Artwork licence | ISC |
| Attribution | BlueLuscious |
| Members | All twenty-six canonical foundational icon objects |

The explicit member list is curated independently from `AsterIcons`. Adding another canonical icon
to the package therefore does not silently add it to Amellus. Seven current definitions also
belong to `AsterCollection`; both collections retain the same immutable icon values without a
reverse membership link.

## Imports

```ts
import {
  AmellusCollection,
  AsterCollection,
  AsterCollections,
} from "@aster/icons/collections";
```

An isolated collection import avoids evaluating the complete collection index:

```ts
import { AmellusCollection } from "@aster/icons/collections/amellus";
import { AsterCollection } from "@aster/icons/collections/aster";
```

The family subpath provides complete collection discovery; the isolated subpath loads only the
selected collection and its declared icon members. The icon-only package root does not expose
collections.

`AsterCollections` supports complete package discovery without making a collection the owner of
the icon catalogue. Catalogue source synchronisation adds or removes canonical collection modules
from this generated authority. Collection membership remains explicitly authored; changing a
collection changes derived membership only and does not add or remove definitions from
`AsterIcons`.

Visual rationale and enforcement severity remain canonical in the
[Amellus Visual Design Contract](../../../collections/amellus/design-contract.md) and the
[Aster Collection Design Contract](../../../collections/aster/design-contract.md).
