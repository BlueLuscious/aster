# Portable Icon Core

Status: **Accepted**

`@aster/core` owns Aster's serialisable, target-independent icon model. It allows source pipelines,
generated collection modules, renderers, and framework adapters to exchange the same values
without importing SVG parser syntax, DOM objects, framework state, or repository tooling.

## Current boundary

The current package is a type foundation. It exposes contracts and closed value unions but no
runtime values, constructors, registries, renderers, or global identity authority.

Runtime construction and deep immutability remain outside the observable package until their
validation behaviour is implemented and tested.

## Features

| Feature | Responsibility |
| --- | --- |
| [Definition](definition/index.md) | Complete definition, identity, and viewBox objects. |
| [Node](node/index.md) | Closed portable geometry primitives and coordinate pairs. |
| [Metadata](metadata/index.md) | Resolved runtime metadata and right-to-left policy. |
| [Presentation](presentation/index.md) | Explicit paint data, node presentation, and collection override policy. |
| [Render](render/index.md) | Target-independent options passed with a definition. |

## Dependency boundary

Core has no runtime dependency. Its production compilation uses ES2022 only and includes no Node,
DOM, browser, Lilium, Lotus, parser, renderer, or repository-tooling ambient types.

Consumers depend on Core; Core never depends on a collection, build pipeline, renderer, framework,
or target.

## Public type surface

The source root re-exports the public contracts and types documented by each feature. There is no
public value API yet. Exact distribution exports and implementation-subpath rejection are defined
only after a built package ABI exists.

## Stable invariants

- A definition has one identity, one positive viewBox, non-empty ordered nodes, and resolved
  metadata.
- Node discriminators form a closed union.
- Presentation uses explicit fields rather than an arbitrary attribute map.
- A variant is a distinct identity and cannot be selected through render options.
- Public objects and sequences are read-only at the type boundary.
- Numeric, textual, ordering, cloning, and deep-freeze invariants require runtime validation and
  are not claimed by the type surface alone.

The architecture authority for this model is
[Portable Icon Model](../../architecture/portable-icon-model.md).
