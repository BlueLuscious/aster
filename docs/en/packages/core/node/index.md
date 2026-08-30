# Core Node

Status: **Accepted**

The node feature represents the supported portable geometry subset. It preserves primitive
identity and does not expose root SVG, structural groups, transforms, namespaces, parser tokens,
or renderer handles.

## Model boundary

Core uses named discriminated objects rather than positional tuples or a general SVG syntax tree.
Named fields keep authored geometry reviewable and make TypeScript narrowing explicit; the closed
union prevents parser tokens, unsafe syntax and browser-oriented features from entering portable
consumers. Source syntax and the portable geometry model therefore remain separate authorities.

Supported primitives retain their identity rather than becoming paths solely to simplify one
target. Root SVG and structural group elements are source or target structure, not portable nodes.

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
uses the same authority for runtime dispatch and canonical output. The frozen authority is
exported from the package root so renderers and adapters can dispatch without replicating Core
discriminators.

Readonly arrays prevent mutation through the type surface. Runtime construction must clone and
deeply freeze node and point sequences before the package claims immutable accepted values.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconNodeNormaliser` | Validates the closed discriminator union, geometry, presentation, and paint order before cloning and freezing every node. | Uses `IconPresentationNormaliser` and `IconPointSequenceNormaliser`. |
| `IconPointSequenceNormaliser` | Validates point cardinality, exact point fields, and finite coordinates before creating a deeply frozen sequence. | Produces the points retained by polyline and polygon nodes. |

Core trims `IconPathNode.data` and requires non-empty text. It deliberately does not parse SVG
path grammar. A canonical TypeScript author remains responsible for supplying reviewed path data;
an external-source workflow must validate and canonicalise that syntax before calling
`Icon.define()`.

A new node kind requires a demonstrated portable source and consumer, deterministic validation
and target rules, safety evidence, and an explicit compatibility assessment. Core does not expand
its geometry union merely to mirror an available SVG feature.
