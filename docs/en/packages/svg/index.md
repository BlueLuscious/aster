# SVG Renderer

Status: **Accepted**

`@aster/svg` owns framework-independent conversion of portable `@aster/core` icon definitions into
complete standalone SVG markup. It is a public target renderer with no DOM, browser, Node, Import,
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
| [Workflow](workflow.md) | Traces one definition and option value through the accepted runtime composition. |
| [Quality](quality.md) | Records the accepted public boundary, distribution, consumers, and conformance evidence. |
| [Quality Baseline](quality-baseline.md) | Defines reproducible rendering, performance, and distribution evidence. |

## Dependency boundary

The package depends only on the public root of `@aster/core`. It consumes `IconDefinition`,
`IconRenderOptions`, and the frozen portable runtime authorities required to interpret them. It
cannot import Core implementation paths, Import, a collection catalogue, a framework, or a
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
- host-independent declarations without DOM, Node, framework, Import, or tooling references;
- side-effect-free ESM without CommonJS compatibility output;
- deterministic representative markup from an explicitly supplied definition;
- import and rendering from an isolated consumer containing only publishable Core and SVG files.

Runtime tests separately cover every supported primitive, the complete real Icons corpus,
presentation, accessibility, direction, exact XML 1.0 acceptance, contextual escaping,
invalid-target, and definition-immutability scenarios. Accepted decisions and bounded future
change pressures are recorded in [Quality](quality.md). Detailed semantics remain canonical in
[Render](render/index.md), [Workflow](workflow.md), [API](api/index.md), and
[Error](error/index.md).

SVG remains a dedicated package because target syntax, escaping, accessibility mapping and target
failures do not belong in portable Core. The `Svg` name deliberately distinguishes rendering from
Core's `Icon.define()` construction authority. A consumer needing SVG installs this second package;
a browser consumer still owns its own safe parsing or insertion boundary.
