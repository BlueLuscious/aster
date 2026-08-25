# SVG Render Error

Status: **Accepted**

The error feature owns deterministic programming failures raised by the public SVG target. It
does not expose Core construction errors, native parser messages, Build source diagnostics, or
partially rendered markup.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `SvgRenderError` | Extends `TypeError` with stable `code` and logical `path` members for an invalid render operation. | Raised by `Svg.render()` for rejected definitions, options, policy overrides, and target representations. |

The class is frozen and exposes static `code` value `ASTER-SVG-001`. Every instance uses
`name` value `SvgRenderError` and the same `code`. Its deterministic message has this form:

```text
ASTER-SVG-001 at <path>: <reason>.
```

The reason is owned by Aster and never copies an exception message from Core or an ambient host.
Consumers may use `instanceof SvgRenderError`, `code`, and `path` to identify programming errors;
source-authoring workflows continue to use Build diagnostics.

The renderer translates public Core `IconDefinitionError` instances because an invalid portable
definition cannot enter the SVG target. It preserves the Core logical path but replaces the reason
with stable SVG-owned language. Translation is identity-based rather than provenance-based: every
`IconDefinitionError` instance is translated, including one deliberately thrown by caller-owned
reflection. All other exceptions raised by caller-controlled reflection or execution propagate
unchanged.
