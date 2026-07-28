# Product and Package Boundaries

Status: **Accepted**

This document defines Aster's product responsibility, dependency direction, and package-creation
rules. Package names remain provisional until their implementation and distribution boundaries are
proven.

## Product boundary

Aster is an independent icon platform. It owns:

- portable immutable icon definitions;
- curated collection sources and design contracts;
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
| Collection sources | Editable masters, canonical SVG, metadata, and collection design contracts. | Authored inputs, never runtime code. |
| Build pipeline | Source loading boundaries, parsing, diagnostics, validation, normalisation, and generation planning. | Build-time only. |
| Generated definitions | Typed immutable icon and collection modules produced from canonical sources. | Portable runtime data. |
| Renderer | Converts portable definitions and options into one explicit target output. | Public and target specific. |
| Framework adapter | Exposes definitions through a framework's public component and rendering contracts. | Optional and framework specific. |
| Target adapter | Maps framework-independent or framework-specific declarations to a concrete platform such as DOM. | Optional and target specific. |
| Repository tooling | Workspace checks, safe cleanup, CI adapters, and contributor-only operations. | Private development infrastructure. |

Generated definitions are conceptually separate from Core even if early evidence places them in
the same physical package. Core defines the data contract; collections own icon data; generators
produce its distribution modules. Their final package layout must be validated by import,
tree-shaking, versioning, and release evidence.

## Initial package strategy

Only these implementation boundaries justify an initial package when their code begins:

1. A public portable Core package for host-independent definitions, options, and construction
   authority.
2. One private build-time boundary containing parsing, validation, normalisation, and generation
   features until independent consumers justify extraction.
3. A public SVG renderer package after its exact output contract is accepted.

Experimental collection output may use a private generated test package or fixture boundary. It
does not become a public collection package until the pilot proves its identity, versioning, and
distribution requirements.

Parser, validator, normaliser, and generator responsibilities remain separate features and test
boundaries inside the initial build-time implementation. They are not separate packages merely
because their algorithms differ.

Framework and platform adapters are created only when their upstream public contracts are stable
and an end-to-end integration can be tested. Empty adapter shells are prohibited.

## Data flow

Canonical source moves through build-time services into generated portable definitions. A
consumer then passes those definitions to a generic renderer or framework adapter:

```text
canonical collection sources
            |
            v
private build-time boundary
            |
            v
generated definition modules
            |
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
generated definition modules -----> portable Core
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

A build-time boundary may begin private without implying that its contracts are repository
specific. It becomes a public package only after an independent consumer and versioning boundary
exist.

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

## Provisional names

Names describe likely distribution boundaries but are not accepted registry reservations:

| Responsibility | Provisional name |
| --- | --- |
| Portable Core | `@aster/core` |
| Private build-time implementation | `@aster/build` or a private workspace tooling package |
| Generated collection definitions | `@aster/<collection>` or another collection-oriented boundary |
| Generic SVG renderer | `@aster/svg` |
| Generated collection-target integration | `@aster/<collection>-<target>` |
| Target-independent Lilium adapter | `@aster/lilium` |
| DOM-specific Lilium mappings | `@aster/lilium-dom` if evidence requires a separate package |

Changing a provisional name does not change the accepted responsibility or dependency direction.
