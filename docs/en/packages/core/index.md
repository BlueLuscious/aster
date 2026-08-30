# Portable Icon Core

Status: **Accepted**

`@aster/core` owns Aster's serialisable, target-independent icon model. It allows source adapters,
canonical icon packages, renderers, and framework adapters to exchange the same values
without importing SVG parser syntax, DOM objects, framework state, or repository tooling.

## Current boundary

The current package exposes contracts, closed value unions, immutable portable runtime
authorities, and the `Icon` and `Collection` API objects. It contains no renderer, catalogue,
registry, or global identity authority.

## Features

| Feature | Responsibility |
| --- | --- |
| [API](api/index.md) | Immutable icon and collection construction authorities and exact package exports. |
| [Collection](collection/index.md) | Independent collection identity, metadata, direct membership, and immutable construction. |
| [Definition](definition/index.md) | Complete definition, identity, viewBox, and immutable construction flow. |
| [Node](node/index.md) | Closed portable geometry primitives and coordinate pairs. |
| [Metadata](metadata/index.md) | Resolved runtime metadata and right-to-left policy. |
| [Presentation](presentation/index.md) | Explicit paint data, node presentation, and collection override policy. |
| [Render](render/index.md) | Target-independent options passed with a definition. |
| [Shared](shared/index.md) | Internal primitive assertions and the public deterministic Core failure boundary. |
| [Workflow](workflow.md) | End-to-end icon and collection construction, validation, isolation, and consumption flow. |
| [Quality](quality.md) | Public inventory, consumer conformance, distribution evidence, and future pressure boundaries. |

## Dependency boundary

Core has no runtime dependency. Its production compilation uses ES2022 only and includes no Node,
DOM, browser, Lilium, Lotus, parser, renderer, or repository-tooling ambient types.

Consumers depend on Core; Core never depends on a collection, importer, renderer, framework,
or target.

Generated declarations are host-independent and import only relative package modules. Development
tools such as TypeScript, `tsx`, and Node type declarations do not enter the package ABI.

## Public surface

The package root exports:

| Symbol | Kind | Authority |
| --- | --- | --- |
| `Icon` | Frozen value object | Validates and constructs definitions through `define()`. |
| `Collection` | Frozen value object | Validates and constructs independent collections through `define()`. |
| `IconDefinitionError` | Frozen error class | Distinguishes invalid authored Core definitions through stable code and path fields. |
| Portable runtime authorities | Frozen values | Define node, presentation, metadata, and render-option vocabularies required by consumers. |
| Feature contracts and types | Type-only exports | Describe portable definitions, nodes, metadata, presentation, and options. |

Only the root package export `"."` is approved. Runtime implementation paths and feature subpaths
are rejected by the package export map.

The package declares `sideEffects: false`, emits native ESM, and performs no registration,
catalogue mutation, or host initialisation while modules are imported. This structure permits
consumer tooling to analyse and remove unused modules; Aster does not claim a particular
tree-shaking result for every bundler.

## Stable invariants

- A definition has one identity, one positive viewBox, non-empty ordered nodes, and resolved
  metadata.
- An icon identity never carries collection membership.
- A collection may be empty and retains unique icon definitions directly.
- The same icon value may be retained by multiple collections without mutation.
- Node discriminators form a closed union.
- Presentation uses explicit fields rather than an arbitrary attribute map.
- A variant is a distinct identity and cannot be selected through render options.
- Public objects and sequences are read-only at the type boundary.
- Numeric, textual, ordering, cloning, and deep-freeze invariants require runtime validation and
  are enforced by internal construction rather than claimed by the type surface alone.

The package-local authorities for this model are [Definition](definition/index.md),
[Node](node/index.md), [Metadata](metadata/index.md), [Presentation](presentation/index.md), and
[Render](render/index.md). [Workflow](workflow.md) defines how those features construct and hand
off one complete portable value.

## Deferred boundaries

- Full SVG path parsing, source diagnostics, and canonical path rewriting belong to the ingestion
  pipeline.
- Cross-definition identity uniqueness, replacement availability, and replacement-cycle checks
  require a complete generation unit.
- Effective licence completion is mandatory at a distributable collection boundary rather than
  for every experimental Core value.
- Accessibility combinations and collection override authority are validated when a renderer
  interprets `IconRenderOptions`.

These requirements remain outside Core until a consumer proves the corresponding boundary. Core
does not represent them through unused registries, parser contracts, or host abstractions.
