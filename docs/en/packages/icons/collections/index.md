# Canonical Collections

Status: **Accepted**

The `collections` feature owns independently identified immutable collection definitions. The
collection manifest provides complete discovery and exact loaders resolve selected definitions.
The accepted concrete authority is currently `AmellusCollection`.

Canonical modules use `<collection-slug>.collection.ts`. Public imports omit the role and retain
`@aster/icons/collections/<collection-slug>`.

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

The explicit member list is curated independently from the icon manifest. Adding another canonical icon
to the package therefore does not silently add it to Amellus. The same canonical icon may later be
retained by another collection with identical object identity and without acquiring a mutable
reverse membership link. Core rejects duplicate logical identity only within one collection.

## Imports

```ts
import { AmellusCollection } from "@aster/icons/collections/amellus";
```

The isolated subpath loads only the selected collection and its declared icon members. Complete
collection discovery uses `@aster/icons/manifest`; runtime identity selection uses
`@aster/icons/dynamic`. The package does not export a bare collection-family aggregate.

Collection membership remains explicitly authored. Changing a collection changes its derived
membership record only and does not add or remove independent icon definitions.

Visual rationale and enforcement severity remain canonical in the
[Amellus Visual Design Contract](../../../collections/amellus/design-contract.md).
