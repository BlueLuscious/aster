# Collection Authorities

Status: **Experimental**

The `collections/constants` feature owns the internal immutable authoring authorities shared by
icon modules. It currently contains only `asterCollection`.

Canonical collection modules use `<collection-slug>.collection.ts`. The current authority is
declared by `aster.collection.ts`.

## `asterCollection`

The current authority centralises:

| Field | Value | Consumer |
| --- | --- | --- |
| Collection slug | `aster` | Every `IconIdentity`. |
| Artwork licence | ISC | Every portable `IconMetadata`. |
| Attribution | BlueLuscious | Every portable `IconMetadata`. |
| ViewBox | `0 0 24 24` | Every `IconDefinition`. |
| Presentation defaults | Outline using SVG `currentColor`, `1.5` stroke, round caps and joins. | Every collection presentation policy. |
| Presentation overrides | Empty | Renderers reject fill, stroke, or stroke-width overrides. |
| Default size | `24` | Renderers when no explicit size is supplied. |
| Minimum size | `16` | Render-option validation and curatorial review. |

The object and its nested retained values are immutable. Core still clones and deeply freezes
each accepted definition, so no icon shares mutable caller-owned state.

Collection authorities are implementation-only and are not exported through `@aster/icons`.
Consumers receive resolved values through each portable definition rather than depending on
collection authoring internals.

Visual rationale and enforcement severity remain canonical in the
[Aster Collection Design Contract](../../../collections/aster/design-contract.md).
