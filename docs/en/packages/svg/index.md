# SVG Renderer

Status: **Experimental**

`@aster/svg` owns framework-independent conversion of portable `@aster/core` icon definitions into
complete standalone SVG markup. It is a public target renderer with no DOM, browser, Node, Build,
Lilium, or Lotus authority.

## Current boundary

The package implements deterministic definition-to-markup rendering through its public `Svg`
object. Each call revalidates and isolates the supplied definition through Core, accepts the
closed render options, resolves effective presentation, and returns complete markup atomically.

## Features

| Feature | Responsibility |
| --- | --- |
| [API](api/index.md) | Exposes the immutable `Svg` rendering authority. |
| [Error](error/index.md) | Defines deterministic programming failures at the target boundary. |
| [Render](render/index.md) | Defines and implements the atomic standalone SVG markup result. |
| [Workflow](workflow.md) | Traces one definition and option value through the current runtime composition. |
| [Quality](quality.md) | Inventories the public boundary, distribution, consumers, evidence, and audit pressures. |

## Dependency boundary

The package depends only on the public root of `@aster/core`. It consumes `IconDefinition`,
`IconRenderOptions`, and the frozen portable runtime authorities required to interpret them. It
cannot import Core implementation paths, Build, a collection catalogue, a framework, or a
platform host.

The target remains native ES2022 ESM. Production compilation excludes DOM, browser, Node, and
framework ambient types.

## Package surface

The approved package export is the root `"."`. It exposes:

| Symbol | Kind | Responsibility |
| --- | --- | --- |
| `Svg` | Public immutable object | Renders one explicitly supplied definition and options. |
| `SvgApi` | Public interface | Declares explicit definition-to-markup rendering. |
| `SvgMarkupType` | Public type | Represents complete standalone SVG markup as a plain string. |
| `SvgRenderError` | Public class | Reports deterministic definition, option, and representation failures. |

No implementation subpath is public.

## Package conformance

The compiled-package ABI suite verifies:

- the exact `Svg` and `SvgRenderError` root value surface;
- import through the approved `@aster/svg` root and rejection of implementation subpaths;
- the exact root declaration and manifest export;
- dependency on the public `@aster/core` root only;
- host-independent declarations without DOM, Node, framework, Build, or tooling references;
- side-effect-free ESM without CommonJS compatibility output;
- deterministic representative markup from an explicitly supplied definition.

Runtime tests separately cover every supported primitive and representative presentation,
accessibility, direction, escaping, invalid-target, and definition-immutability scenarios. The
remaining hardening pressures and evidence limits are recorded in [Quality](quality.md). Detailed
semantics remain canonical in [Render](render/index.md) and
[Accessibility and Direction](../../architecture/accessibility-and-direction.md).

The stable semantics are defined by the
[Rendering Contract](../../architecture/rendering-contract.md) and
[Accessibility and Direction](../../architecture/accessibility-and-direction.md). The package
boundary and API naming rationale are recorded by
[Public SVG Renderer Boundary](../../decisions/0005-public-svg-renderer-boundary.md).
