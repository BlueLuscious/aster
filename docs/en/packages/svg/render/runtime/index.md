# SVG Render Runtime

Status: **Accepted**

The render runtime is the internal stateless composition behind `Svg.render()`. It has no public
implementation subpath and retains no definition, context or result between calls.

## Composition

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `SvgRenderer` | Coordinates definition acceptance, option normalisation and complete serialisation. | Owned by the frozen public `Svg` object. |
| `SvgRenderOptionsNormaliser` | Captures closed option data and resolves its effects. | Produces `ISvgRenderContext`; uses Core policy and public vocabularies. |
| `ISvgRenderContext` | Carries the isolated definition, viewport, colour context, presentation overrides, accessibility and direction for one call. | Immutable private contract consumed by `SvgMarkupSerialiser`. |
| `SvgMarkupSerialiser` | Resolves node presentation and emits complete target markup. | Consumes only the accepted context; composes number, path and XML authorities. |
| `SvgPathDataSerialiser` | Maps structured Core commands to expanded SVG path data. | Uses public Core discriminators and internal `svgPathCommandLetters`; performs no source parsing. |
| `SvgNumberSerialiser` | Produces canonical locale-independent numeric spelling. | Shared by geometry, presentation and path serialisation. |
| `SvgXmlCharacterValidator` | Enforces XML 1.0 over JavaScript code points. | Used for option text and serialised source values; raises `SvgRenderError`. |
| `svgRenderOptionsSchema` | Defines this target's closed option fields. | Includes the public Core override vocabulary rather than copying it. |
| `svgXmlCharacterRanges` | Defines immutable XML 1.0 boundaries. | Separates character acceptance from contextual escaping. |

The composition consumes Core's public geometry, direction, paint and presentation authorities.
It neither copies their domain vocabularies nor imports private Core paths.

## Definition acceptance

`SvgRenderer` first calls public `Icon.define()` to reconstruct and deeply freeze the complete
portable graph. Static types and previously frozen input do not bypass that step.
[SVG Error](../../error/index.md) owns translation of Core failures during this stage; no other
stage is inside the definition-translation catch boundary.

## Option acceptance

The normaliser accepts an omitted value or an ordinary/null-prototype record. It inspects own
keys and descriptors, rejects unknown, symbolic, hidden or accessor fields, and captures accepted
data values into a frozen local snapshot. Ordinary getters are not invoked. Value normalisation
then reads that snapshot, not the caller's record; proxy reflection can still execute caller code.

It validates numeric, paint, text, boolean and direction values, checks icon override authority
and minimum size, and resolves one context. [Core Render Options](../../../core/render/index.md)
owns portable semantics; [SVG Render Result](../index.md) owns the target representation.

## Serialisation

The serialiser resolves presentation for each node, delegates structured paths and numeric
conversion, checks XML characters as values enter target contexts, and builds the complete string.
Output ordering, escaping and RTL arithmetic are specified once in
[SVG Render Result](../index.md).

Target validation can fail during serialisation, even after the context was accepted. Only local
intermediate strings are discarded: there is no external stream or target to roll back. The
[workflow](../../workflow.md) documents the complete transaction and consumer hand-off.
