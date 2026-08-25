# SVG API

Status: **Accepted**

The API feature exposes the immutable public target authority `Svg`.

## Contract

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `SvgApi` | Declares `render()` from one explicit definition and optional portable options to complete SVG markup. | Accepts Core `IconDefinition` and `IconRenderOptions`; returns `SvgMarkupType`. |

`SvgApi` introduces no target-extension object. Arbitrary attributes,
events, DOM nodes, framework controllers, lifecycle values, and variant selection remain outside
the accepted operation.

The runtime value uses the object API:

```ts
const markup = Svg.render(Camera, {
  size: 24,
  label: "Camera",
});
```

`Svg.render()` retains no definition, catalogue, mount, or lifecycle state.

## Failure boundary

Invalid definitions, options, policy overrides, or target representations raise the public
[`SvgRenderError`](../error/index.md) programming error. That document owns its complete stable
observable shape and translation rules.

The renderer either returns complete markup or throws before returning any output. Render-option
programming errors do not use Build source diagnostics. A Core `IconDefinitionError` becomes an
SVG-owned definition rejection with the same logical path and no copied Core message. Exceptions
from caller-controlled reflection or execution propagate with their original identity unless they
use the public `IconDefinitionError` identity, which is translated consistently regardless of
where it was constructed.

## Deliberate surface

`SvgApi` remains public so programmatic hosts can describe the exact object capability without
depending on its implementation class. `SvgMarkupType` names a complete target result across API,
renderer, host, and documentation boundaries while remaining structurally a string; it does not
brand safe HTML or authorise DOM insertion.

No implemented consumer requires batch, fragment, stream, file, DOM, or extension operations.
Repeated rendering and output commitment remain host compositions over the sole atomic
`Svg.render()` operation.
