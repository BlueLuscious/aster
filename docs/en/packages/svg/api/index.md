# SVG API

Status: **Accepted**

The API feature exposes the frozen `Svg` rendering object. It owns one stateless private renderer;
all per-call data remains local.

## Contract

| Contract | Operation | Responsibility and relations |
| --- | --- | --- |
| `SvgApi` | `render(definition: IconDefinition, options?: IconRenderOptions): SvgMarkupType` | Describes an explicit target capability; accepts Core values and returns the complete [render result](../render/index.md). |

`SvgApi` lets programmatic hosts describe that capability without depending on an implementation
class. It admits no arbitrary attributes, events, DOM nodes, framework state or variant selection.

## Usage

```ts
const markup = Svg.render(Camera, {
  size: 24,
  label: "Camera",
});
```

`Camera` is an explicitly supplied Core definition. [Core Render Options](../../core/render/index.md)
owns portable option meanings; [SVG Render Result](../render/index.md) owns their target mapping.

## Package exports

Only the root `"."` export is supported. Runtime exports are `Svg` and `SvgRenderError`;
type-only exports are `SvgApi` and `SvgMarkupType`. Renderer classes, normalisers, serialisers,
schemas and the internal context are private, even when their emitted modules exist.

Repeated rendering, collection traversal, file output, streams and DOM insertion remain host
compositions over the sole atomic `render()` operation.

## Failure

A call returns complete markup or throws without returning partial output.
[`SvgRenderError`](../error/index.md) owns target programming failures and the precise translation
boundary for Core errors. Import source diagnostics are a separate failure model.
