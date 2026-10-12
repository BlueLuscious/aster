# SVG Renderer

Status: **Accepted**

`@luscious-garden/aster-svg` converts portable Core definitions into deterministic standalone SVG
markup. It is a target renderer, not an icon catalogue, source importer or DOM adapter.

## Boundary

The frozen `Svg` object renders one explicitly supplied definition and optional render options.
Each synchronous call revalidates the definition through Core and returns one complete string or
throws. No definition, render context or output survives as package-owned state between calls.

SVG depends only on the public Core root. It emits native ES2022 ESM with `sideEffects: false`;
production declarations use no DOM, Node, browser or framework ambient types. Only the package
root `"."` is public. The [API](api/index.md) owns its exact surface.

Target syntax, escaping, accessibility mapping and target failures belong here rather than in
portable Core. Rendering grants no filesystem, parser, lifecycle or trusted DOM-insertion
authority; hosts own any subsequent use of the string.

## Documentation

| Page | Owns |
| --- | --- |
| [API](api/index.md) | The public operation, capability contract and export boundary. |
| [Render Result](render/index.md) | Complete SVG representation, attribute order, XML acceptance and geometry mapping. |
| [Render Runtime](render/runtime/index.md) | Private composition, accepted context and local transaction stages. |
| [Error](error/index.md) | Stable failure shape, definition-error translation and exception provenance. |
| [Workflow](workflow.md) | Input-to-output hand-offs and consumer responsibilities. |
| [Quality](quality.md) | Runtime, type, ABI and workflow conformance evidence. |
| [Quality Baseline](quality-baseline.md) | Package scenarios, historical measurements and retained experiments. |
| [Releases](releases/index.md) | Published versions and output migrations. |

The [package dependency graph](../index.md) owns ecosystem relationships. The
[project publication procedure](../../project/publication.md) owns registry checks and approval.
