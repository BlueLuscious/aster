# SVG Render Runtime

Status: **Experimental**

The render runtime is an internal stateless composition behind `Svg.render()`. It has no public
implementation subpath and retains no definition, catalogue, host, or render result between calls.

## Composition

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `SvgRenderer` | Coordinates definition isolation, option acceptance, and complete serialisation. | Owned by the public `Svg` object. |
| `SvgRenderOptionsNormaliser` | Validates the closed option object and resolves viewport, presentation overrides, accessibility, and direction. | Produces `ISvgRenderContext`; raises `SvgRenderError`. |
| `ISvgRenderContext` | Carries the accepted immutable values required for one render operation. | Contains the isolated Core definition and accepted option effects. |
| `SvgMarkupSerialiser` | Traverses portable nodes and emits canonical complete markup. | Consumes only `ISvgRenderContext`. |
| `svgRenderOptionsSchema` | Owns the closed option fields and runtime grammar used by this target boundary. | Used only during SVG option acceptance. |
| `svgMarkupSchema` | Owns the XML character grammar enforced before serialisation. | Prevents Core-valid text from producing malformed target markup. |

Core's public `iconNodeKinds`, `iconDirections`, `iconRtlPolicies`, `iconPaintSchema`,
`iconPresentationOverrideOrder`, and `iconTechnicalPresentation` values are the runtime
authorities used by this composition. SVG does not copy those portable vocabularies or import
private Core paths.

## Flow

1. `SvgRenderer` passes the supplied definition to public `Icon.define()`.
2. Core validates, clones, canonicalises, and deeply freezes the portable value.
3. A Core rejection becomes `SvgRenderError` at the same logical path without exposing the Core
   message.
4. `SvgRenderOptionsNormaliser` rejects unsupported fields and malformed values.
5. It enforces collection override authority, viewport minimums, accessibility conflicts, and
   explicit direction.
6. `SvgMarkupSerialiser` resolves technical defaults, collection defaults, node values, and
   authorised caller overrides for each node.
7. It emits geometry in paint order, places optional title content first, and wraps mirror-policy
   RTL geometry exactly once.
8. The complete string is returned only after successful serialisation.

All intermediate values are local to the call. Equivalent accepted calls therefore produce the
same bytes, and no failure can return partial markup.
