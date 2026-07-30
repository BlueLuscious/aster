# SVG Render Error

Status: **Experimental**

The error feature owns deterministic programming failures raised by the public SVG target. It
does not expose Core construction errors, native parser messages, Build source diagnostics, or
partially rendered markup.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `SvgRenderError` | Extends `TypeError` with stable `code` and logical `path` members for an invalid render operation. | Raised by `Svg.render()` for rejected definitions, options, policy overrides, and target representations. |

Every instance uses `name` value `SvgRenderError` and code `ASTER-SVG-001`. Its deterministic
message has this form:

```text
ASTER-SVG-001 at <path>: <reason>.
```

The reason is owned by Aster and never copies an exception message from Core or an ambient host.
Consumers may use `instanceof SvgRenderError`, `code`, and `path` to identify programming errors;
source-authoring workflows continue to use Build diagnostics.
