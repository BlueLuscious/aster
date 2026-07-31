# Core Presentation

Status: **Accepted**

The presentation feature owns explicit portable paint fields and the resolved icon policy that
controls defaults and caller overrides. It does not admit arbitrary SVG attributes, CSS,
URLs, gradients, classes, styles, or events.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconPresentation` | Carries optional fill, stroke, stroke geometry, and opacity fields. | Extended by every node and used by icon defaults. |
| `IconPresentationPolicy` | Carries resolved defaults, duplicate-free override capabilities, and optional viewport size guidance. | Retained by `IconMetadata` and interpreted by renderers. |

## Types

| Type | Values or form | Responsibility |
| --- | --- | --- |
| `IconPaintType` | `none`, `currentColor`, or `#`-prefixed literal | Closed portable paint representation; runtime validates canonical hexadecimal sRGB. |
| `IconFillRuleType` | `nonzero`, `evenodd` | Portable fill algorithm. |
| `IconStrokeLineCapType` | `butt`, `round`, `square` | Portable stroke endpoint shape. |
| `IconStrokeLineJoinType` | `miter`, `round`, `bevel` | Portable stroke corner shape. |
| `IconPresentationOverrideType` | `fill`, `stroke`, `strokeWidth` | Capability an icon permits callers to override. |

Opacity values use the inclusive range from zero to one. Widths and corner radii are non-negative;
miter limits and declared viewport sizes are positive. These numeric constraints require runtime
validation.

## Feature-owned authorities

| Authority | Responsibility |
| --- | --- |
| `iconPaintSchema` | Defines portable paint keywords and canonical short and long hexadecimal colour grammar. |
| `iconPresentationEnumerations` | Defines accepted fill-rule, stroke-line-cap, and stroke-line-join values. |
| `iconPresentationFields` | Defines the single closed presentation-field order shared by node and presentation validation. |
| `iconPresentationOverrideOrder` | Defines accepted caller override capabilities in canonical semantic order. |
| `iconTechnicalPresentation` | Defines the complete lowest-precedence presentation of the portable model. |

Public presentation unions derive from these immutable authorities wherever both represent the
same closed set. Core exports `iconPaintSchema`, `iconPresentationEnumerations`,
`iconPresentationOverrideOrder`, and `iconTechnicalPresentation` as frozen root values because
target consumers require them. `iconPresentationFields` remains internal because it owns Core
validation order rather than portable consumer behaviour.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconPresentationNormaliser` | Validates explicit presentation, canonicalises hexadecimal sRGB colours, and emits fields in stable order. | Produces node and icon-default presentation. |
| `IconPresentationPolicyNormaliser` | Validates defaults, unique override capabilities, and positive viewport guidance before canonical ordering and deep freezing. | Produces the policy retained by `IconMetadata`. |

When both viewport hints are present, `minimumSize` cannot exceed `defaultSize`. Override
capabilities are retained in semantic order regardless of authored order.

Presentation precedence is defined by
[Rendering Contract](../../../architecture/rendering-contract.md).
