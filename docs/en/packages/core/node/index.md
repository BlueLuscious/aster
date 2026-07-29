# Core Node

Status: **Accepted**

The node feature represents the supported portable geometry subset. It preserves primitive
identity and does not expose root SVG, structural groups, transforms, namespaces, parser tokens,
or renderer handles.

## Contracts

| Contract | Geometry |
| --- | --- |
| `IconPoint` | One finite named `x` and `y` coordinate pair. |
| `IconPathNode` | Non-empty path data supplied by an authoritative ingestion boundary. |
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

## Feature-owned authorities

| Authority | Responsibility |
| --- | --- |
| `iconNodeKinds` | Defines the exact discriminator for each supported portable geometry node. |

Every node contract derives its `kind` property from `iconNodeKinds`, and `IconNodeNormaliser`
uses the same authority for runtime dispatch and canonical output. The authority remains internal
and does not add a public runtime export.

Readonly arrays prevent mutation through the type surface. Runtime construction must clone and
deeply freeze node and point sequences before the package claims immutable accepted values.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconNodeNormaliser` | Validates the closed discriminator union, geometry, presentation, and paint order before cloning and freezing every node. | Uses `IconPresentationNormaliser` and `IconPointSequenceNormaliser`. |
| `IconPointSequenceNormaliser` | Validates point cardinality, exact point fields, and finite coordinates before creating a deeply frozen sequence. | Produces the points retained by polyline and polygon nodes. |

Core trims `IconPathNode.data` and requires non-empty text. It deliberately does not parse SVG
path grammar. A distributable definition must come from an ingestion pipeline that validates and
canonicalises path syntax before calling `Icon.define()`.

The canonical geometry and extension rules are defined by
[Portable Icon Model](../../../architecture/portable-icon-model.md).
