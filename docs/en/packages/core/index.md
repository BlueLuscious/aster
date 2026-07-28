# Portable Icon Core

Status: **Accepted**

`@aster/core` owns Aster's serialisable, target-independent icon model. It allows source pipelines,
generated collection modules, renderers, and framework adapters to exchange the same values
without importing SVG parser syntax, DOM objects, framework state, or repository tooling.

## Current boundary

The current package exposes contracts, closed value unions, and the immutable `Icon` API object.
It contains no renderer, catalogue, registry, or global identity authority.

## Features

| Feature | Responsibility |
| --- | --- |
| [API](api/index.md) | Immutable definition-construction authority and exact package exports. |
| [Definition](definition/index.md) | Complete definition, identity, viewBox, and immutable construction flow. |
| [Node](node/index.md) | Closed portable geometry primitives and coordinate pairs. |
| [Metadata](metadata/index.md) | Resolved runtime metadata and right-to-left policy. |
| [Presentation](presentation/index.md) | Explicit paint data, node presentation, and collection override policy. |
| [Render](render/index.md) | Target-independent options passed with a definition. |

## Dependency boundary

Core has no runtime dependency. Its production compilation uses ES2022 only and includes no Node,
DOM, browser, Lilium, Lotus, parser, renderer, or repository-tooling ambient types.

Consumers depend on Core; Core never depends on a collection, build pipeline, renderer, framework,
or target.

## Public surface

The package root exports:

| Symbol | Kind | Authority |
| --- | --- | --- |
| `Icon` | Frozen value object | Validates and constructs definitions through `define()`. |
| Feature contracts and types | Type-only exports | Describe portable definitions, nodes, metadata, presentation, and options. |

Only the root package export `"."` is approved. Runtime implementation paths and feature subpaths
are rejected by the package export map.

## Stable invariants

- A definition has one identity, one positive viewBox, non-empty ordered nodes, and resolved
  metadata.
- Node discriminators form a closed union.
- Presentation uses explicit fields rather than an arbitrary attribute map.
- A variant is a distinct identity and cannot be selected through render options.
- Public objects and sequences are read-only at the type boundary.
- Numeric, textual, ordering, cloning, and deep-freeze invariants require runtime validation and
  are enforced by internal construction rather than claimed by the type surface alone.

The architecture authority for this model is
[Portable Icon Model](../../architecture/portable-icon-model.md).
