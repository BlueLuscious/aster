# Core Render Options

Status: **Accepted**

The render feature defines input shared by target renderers. Core stores no rendering behaviour,
target output, mount state, callback, framework controller, or platform extension.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconRenderOptions` | Carries optional viewport size, colour context, allowed presentation overrides, accessibility intent, and explicit direction. | Uses `IconPaintType` and `IconDirectionType`; interpreted with `CollectionPresentationPolicy`. |

The object is closed. It cannot select a variant, replace a viewBox, inject target attributes,
provide events, or carry DOM or framework objects.

## Types

| Type | Values | Responsibility |
| --- | --- | --- |
| `IconDirectionType` | `ltr`, `rtl` | Explicit target-independent rendering direction. |

Accessibility combinations, positive and non-negative numeric constraints, non-empty labels, and
collection override authority are validated by the target renderer before output.

Portable option meaning and precedence are defined by
[Rendering Contract](../../../architecture/rendering-contract.md). Accessibility conflict rules
are defined by
[Accessibility and Direction](../../../architecture/accessibility-and-direction.md).
