# SVG Workflow

Status: **Accepted**

This page traces one supplied definition and optional render value into complete standalone
markup. [Render Runtime](render/runtime/index.md) owns the private composition;
[Render Result](render/index.md) owns exact output rules.

## Render transaction

```text
definition + options
    |
    v
Svg.render()
    |
    +--> public Core reconstruction of the definition
    +--> closed option snapshot and normalisation
    +--> immutable per-call render context
    +--> target serialisation and XML character validation
    |
    v
complete SvgMarkupType
```

1. Core validates and isolates the definition before SVG interprets any target options.
   [Core Workflow](../core/workflow.md) owns that portable construction transaction.
2. The target captures accepted option data, resolves viewport, authorised presentation,
   accessibility and direction, then passes one local context to the serialiser.
3. Serialisation maps ordered portable geometry to SVG, applies effective presentation and
   contextual escaping, and composes the complete document. Target representation failures can
   still occur at this stage.

Every intermediate value remains local. Sharing the stateless renderer does not share invocation
state, mutate the caller or make partial output observable. The
[error boundary](error/index.md) distinguishes target rejections from caller-controlled execution
failures; the operation is not a JavaScript sandbox.

## Consumer hand-off

The result is a plain string, not trusted HTML. A host owns writing, transmission, parsing or DOM
insertion and its associated security policy.

CLI export and review consume the public renderer before composing their own plans and output.
Repository workflows compare TypeScript-first and Import-adopted definitions through the same
operation. These relationships are checked by [SVG Quality](quality.md); they add no host
authority to SVG itself.
