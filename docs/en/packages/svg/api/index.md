# SVG API

Status: **Experimental**

The API feature exposes the immutable public target authority `Svg`.

## Contract

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `SvgApi` | Declares `render()` from one explicit definition and optional portable options to complete SVG markup. | Accepts Core `IconDefinition` and `IconRenderOptions`; returns `SvgMarkupType`. |

`SvgApi` introduces no target-extension object in the initial package. Arbitrary attributes,
events, DOM nodes, framework controllers, lifecycle values, and variant selection remain outside
the accepted operation.

The runtime value uses the object API:

```ts
const markup = Svg.render(Camera, {
  size: 24,
  label: "Camera",
});
```

`Svg.render()` will retain no definition, catalogue, mount, or lifecycle state.

## Failure boundary

Invalid definitions, options, policy overrides, or target representations raise the public
[`SvgRenderError`](../error/index.md) programming error. Its stable observable members are:

| Member | Value or meaning |
| --- | --- |
| `name` | `SvgRenderError` |
| `code` | `ASTER-SVG-001` |
| `path` | Logical failing value path such as `options.size` or `definition.nodes[0].fill`. |
| `message` | Deterministic Aster-owned explanation containing no native exception text. |

The renderer either returns complete markup or throws before returning any output. Render-option
programming errors do not use Build source diagnostics.
