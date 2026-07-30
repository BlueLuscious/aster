# SVG Renderer

Status: **Experimental**

`@aster/svg` owns framework-independent conversion of portable `@aster/core` icon definitions into
complete standalone SVG markup. It is a public target renderer with no DOM, browser, Node, Build,
Lilium, or Lotus authority.

## Current boundary

The package currently declares its public API and markup result contracts. Runtime rendering is
not implemented yet.

## Features

| Feature | Responsibility |
| --- | --- |
| [API](api/index.md) | Declares the immutable `Svg` rendering authority. |
| [Render](render/index.md) | Defines the atomic standalone SVG markup result. |

## Dependency boundary

The package depends only on the public root of `@aster/core`. It consumes `IconDefinition` and
`IconRenderOptions`; it cannot import Core implementation paths, Build, a collection catalogue, a
framework, or a platform host.

The target remains native ES2022 ESM. Production compilation excludes DOM, browser, Node, and
framework ambient types.

## Package surface

The approved package export is the root `"."`. The contract foundation exposes:

| Symbol | Kind | Responsibility |
| --- | --- | --- |
| `SvgApi` | Public interface | Declares explicit definition-to-markup rendering. |
| `SvgMarkupType` | Public type | Represents complete standalone SVG markup as a plain string. |

The runtime `Svg` object and its option-error boundary will join this root during runtime
implementation. No implementation subpath is public.

The stable semantics are defined by the
[Rendering Contract](../../architecture/rendering-contract.md) and
[Accessibility and Direction](../../architecture/accessibility-and-direction.md). The package
boundary and API naming rationale are recorded by
[Public SVG Renderer Boundary](../../decisions/0005-public-svg-renderer-boundary.md).
