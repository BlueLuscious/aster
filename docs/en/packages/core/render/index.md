# Core Render Options

Status: **Accepted**

The render feature defines input shared by target renderers. Core stores no rendering behaviour,
target output, mount state, callback, framework controller, or platform extension.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconRenderOptions` | Carries optional viewport size, colour context, allowed presentation overrides, accessibility intent, and explicit direction. | Uses `IconPaintType` and `IconDirectionType`; interpreted with `IconPresentationPolicy`. |

The object is closed. It cannot select a variant, replace a viewBox, inject target attributes,
provide events, or carry DOM or framework objects.

## Option semantics

| Field | Portable meaning |
| --- | --- |
| `size` | Positive finite square viewport size in target-independent logical units. |
| `colour` | Portable paint context used to resolve `currentColor`. |
| `fill` | Fill override when authorised by the definition's presentation policy. |
| `stroke` | Stroke override when authorised by the definition's presentation policy. |
| `strokeWidth` | Non-negative finite width override in viewBox units when authorised. |
| `label` | Non-empty accessible name. |
| `title` | Non-empty target-native title and fallback accessible name. |
| `decorative` | Explicit decorative or semantic accessibility intent. |
| `direction` | Explicit `ltr` or `rtl` target direction. |

Options never select a variant. Callers select a variant by supplying its distinct definition.
Stroke widths remain in viewBox units and scale with geometry; constant device-pixel strokes are
target-specific and not portable.

## Types

| Type | Values | Responsibility |
| --- | --- | --- |
| `IconDirectionType` | `ltr`, `rtl` | Explicit target-independent rendering direction. |

The immutable `iconDirections` sequence is the feature-owned authority from which
`IconDirectionType` derives. The frozen sequence is exported from the package root so target
renderers can validate options and apply direction without declaring a competing vocabulary.

Accessibility combinations, positive and non-negative numeric constraints, non-empty labels, and
presentation override authority are validated by the target renderer before output.

An icon is decorative when neither `label` nor `title` is supplied. Supplying either makes it
semantic unless explicit `decorative` intent conflicts:

| `decorative` | Name content | Portable result |
| --- | --- | --- |
| Omitted or `true` | None | Decorative. |
| `false` | None | Invalid because semantic output has no accessible name. |
| Omitted or `false` | `label`, `title`, or both | Semantic. |
| `true` | `label`, `title`, or both | Invalid because hidden semantic content conflicts. |

`label` is authoritative when both fields exist; `title` remains supplementary target content.
A target must reject an accepted semantic it cannot represent rather than approximate it.

Omitted direction resolves to `ltr`. RTL behaviour combines explicit direction with the metadata
policy: Preserve never mirrors, Mirror mirrors only for `rtl`, and Manual leaves definition
selection to the caller. Core records these semantics but performs no rendering, ambient direction
lookup, accessible-tree operation, or target validation itself.

Viewport dimensions resolve from explicit `size`, icon `defaultSize`, or viewBox dimensions in
that order. A target rejects explicit size below `minimumSize`. The viewBox is never overridable.
Presentation field precedence is owned by [Core Presentation](../presentation/index.md).
