# Product and Package Boundaries

Status: **Accepted**

This document defines Aster's product responsibility, dependency direction, and package-creation
rules. Package names remain provisional until their implementation and distribution boundaries are
proven.

## Product boundary

Aster is an independent icon platform. It owns:

- portable immutable icon definitions;
- curated collection definitions and design contracts;
- optional SVG and metadata import services;
- source validation and normalisation requirements;
- deterministic definition and wrapper generation;
- target-specific renderers and framework adapters;
- icon-specific technical and visual quality evidence.

Aster does not own application UI semantics, frontend-framework execution, or the component
structure of an external UI library. It can integrate with those systems only through optional
adapters.

The portable root must remain usable without Lilium, Lotus, a frontend framework, DOM, browser, or
Node runtime authority.

## Responsibility map

| Boundary | Responsibility | Runtime status |
| --- | --- | --- |
| Portable Core | Icon definition, node, viewBox, metadata, identity, render options, presentation policy, and immutable construction contracts. | Public and host independent. |
| Import sources | Optional SVG, collection metadata, and icon metadata supplied explicitly to Build. | Build-time inputs, never runtime code. |
| Build pipeline | Acquired-source boundaries, parsing, diagnostics, validation, normalisation, and generation planning. | Build-time only. |
| Collection definitions | Typed immutable icon modules authored directly or produced by an accepted importer. | Portable runtime data. |
| Renderer | Converts portable definitions and options into one explicit target output. | Public and target specific. |
| Framework adapter | Exposes definitions through a framework's public component and rendering contracts. | Optional and framework specific. |
| Target adapter | Maps framework-independent or framework-specific declarations to a concrete platform such as DOM. | Optional and target specific. |
| Repository tooling | Workspace checks, safe cleanup, CI adapters, and contributor-only operations. | Private development infrastructure. |

Collection definitions are conceptually separate from Core. Core defines the data contract;
collections own icon data; and either direct authoring or an importer produces distribution
modules. Their final package layout must be validated by import, tree-shaking, versioning, and
release evidence.

## Initial package strategy

Only these implementation boundaries justify an initial package when their code begins:

1. A public portable Core package for host-independent definitions, options, and construction
   authority.
2. The private `@aster/build` boundary containing parsing, validation, normalisation, and
   generation features until independent consumers justify extraction.
3. A public SVG renderer package after its exact output contract is accepted.

Generated package conformance uses an isolated temporary package. Test output does not establish a
published collection or permanent workspace package.

Parser, validator, normaliser, and generator responsibilities remain separate features and test
boundaries inside the initial build-time implementation. They are not separate packages merely
because their algorithms differ.

Framework and platform adapters are created only when their upstream public contracts are stable
and an end-to-end integration can be tested. Empty adapter shells are prohibited.

## Data flow

Portable definitions may be authored directly or imported through build-time services. A consumer
then passes those same Core values to a generic renderer or framework adapter:

```text
TypeScript authoring --------+
                             +--> portable definition modules
SVG + JSON --> Build --------+             |
                                           v
                                  consumer composition
                                           |
                                           +--> generic target renderer
                                           +--> optional framework adapter
```

## Dependency direction

Arrows mean "depends on":

```text
private build-time boundary ------> portable Core
collection definition modules ----> portable Core
target renderer -------------------> portable Core
framework adapter -----------------> portable Core + framework public APIs
target adapter --------------------> corresponding adapter + target public APIs
generated target wrappers --------> generated definitions + corresponding generic adapter
repository tooling ----------------> build-time services where required
```

No reverse dependency is allowed:

```text
portable Core -X-> build pipeline, renderer, framework, target, collection, Lilium, or Lotus
renderer ------X-> generated collection catalogue or framework adapter
public package -X-> repository-only tooling
```

Generated named wrappers depend on the generic renderer or framework adapter and the corresponding
portable definition. They delegate rendering and never contain a second geometry or rendering
implementation.

Workspace packages depend on one another through explicit workspace dependency declarations.
Filesystem-relative imports across package implementation boundaries are prohibited.

## Build-time and repository tooling

Build-time icon services are product-domain logic. They:

- receive source and configuration boundaries explicitly;
- return Aster-owned results and diagnostics;
- avoid process termination and implicit global filesystem traversal;
- remain reusable by generation commands, CI, and a possible future public CLI.

Repository tooling is contributor infrastructure. It may locate workspace files, adapt domain
results to terminal output, enforce repository-only policies, and set process exit status. Public
runtime packages never depend on it.

The accepted `@aster/build` boundary is private without implying that its contracts are repository
specific. It becomes public only after an independent consumer and versioning boundary exist.
Filesystem discovery, terminal presentation, and process exit remain responsibilities of an
effectful host outside the package. A product CLI should own them when a real import workflow
exists; repository tooling should not become the permanent user-facing host.

## External ecosystem boundaries

Lilium, Lotus, and Aster are independent products:

```text
Lilium -X-> Aster
Aster portable Core -X-> Lilium
Aster -X-> Lotus
Lotus portable Core -X-> Aster
```

An Aster framework adapter may depend on supported public Lilium packages. A Lilium application may
then consume that adapter directly.

Aster exposes no Lotus-specific semantic integration. Lotus may accept icons through generic
inputs, slots, or presentation ports and may own an optional package that composes its adapter with
an Aster adapter. Aster does not know whether an icon represents a Lotus toggle, disclosure,
navigation item, or another component role.

## Lilium adapter prerequisites

A Lilium adapter requires:

- a stable portable Aster definition and renderer-options contract;
- stable public Lilium Component, Template, Renderer, and target-renderer contracts needed by the
  implementation;
- an explicit split between target-independent Lilium declarations and DOM-specific mappings;
- exact primitive and property identity ownership;
- conformance coverage for generic and generated named APIs;
- no import from Lilium implementation paths.

The adapter cannot add Lilium or DOM types to Core, generated portable definitions, or collection
sources.

## Package names

Implemented names are accepted by their package decision record. Remaining names describe likely
distribution boundaries and are not registry reservations:

| Responsibility | Name | Status |
| --- | --- | --- |
| Portable Core | `@aster/core` | Implemented |
| Private build-time implementation | `@aster/build` | Implemented and accepted |
| Release-quality collection definitions | `@aster/icons` | Provisional |
| Generic SVG renderer | `@aster/svg` | Implemented contract foundation |
| Generated icon-target integration | Target package or generated exports, pending evidence | Provisional |
| Target-independent Lilium adapter | `@aster/lilium` | Provisional |
| DOM-specific Lilium mappings | `@aster/lilium-dom` if evidence requires a separate package | Provisional |

Changing a provisional name does not change the accepted responsibility or dependency direction.

The build-time name and ownership decision is recorded by
[Private Build-time Domain Package](../decisions/0002-private-build-time-domain-package.md).
