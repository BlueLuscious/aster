# Core Node

Status: **Accepted**

The node feature represents the supported portable geometry subset. It preserves primitive
identity and does not expose root SVG, structural groups, transforms, namespaces, parser tokens,
or renderer handles.

## Contracts

| Contract | Geometry |
| --- | --- |
| `IconPoint` | One finite named `x` and `y` coordinate pair. |
| `IconPathNode` | Canonical validated path data. |
| `IconCircleNode` | Centre and positive radius. |
| `IconEllipseNode` | Centre and positive horizontal and vertical radii. |
| `IconRectNode` | Origin, non-negative dimensions, and optional non-negative corner radii. |
| `IconLineNode` | Start and end coordinates. |
| `IconPolylineNode` | Ordered sequence of at least two points. |
| `IconPolygonNode` | Ordered sequence of at least three points. |

Every node contract extends `IconPresentation`, so presentation remains explicit and closed while
geometry narrowing uses the literal `kind` discriminator.

## Types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `IconNodeType` | Closed union of all seven supported node contracts. | Used by the ordered `IconDefinition.nodes` sequence. |

Readonly arrays prevent mutation through the type surface. Runtime construction must clone and
deeply freeze node and point sequences before the package claims immutable accepted values.

The canonical geometry and extension rules are defined by
[Portable Icon Model](../../../architecture/portable-icon-model.md).
