# SVG Render Error

Status: **Accepted**

The error feature owns deterministic programming failures raised by the public SVG target. It
does not expose Core construction errors, native parser messages, Import source diagnostics, or
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
source-authoring workflows continue to use Import diagnostics.

During definition acceptance, the renderer translates public Core `IconDefinitionError` instances
because an invalid portable definition cannot enter the target. It preserves the logical path and
uses the fixed reason `expected a valid portable icon definition`, not the Core message.
Classification uses identity rather than provenance: a caller's proxy throwing that class during
Core construction is also translated.

The translation catch surrounds only the `Icon.define()` call. Other exceptions from definition
inspection propagate unchanged, as do caller-controlled execution failures during option
inspection, regardless of their class. Ordinary option accessors are rejected without invocation;
the [runtime boundary](../render/runtime/index.md#option-acceptance) does not sandbox proxies.
