# Core Quality

Status: **Accepted Baseline**

This document inventories the observable `@aster/core` boundary and its current hardening risks.
The measurement method is the [Core Quality Baseline](quality-baseline.md).

## Public inventory

The package exposes only the root subpath. Its runtime values are:

- `Collection` and `Icon`;
- `iconDirections` and `iconRtlPolicies`;
- `iconNodeKinds`;
- `iconPaintSchema`, `iconPresentationOverrideOrder`, and `iconTechnicalPresentation`;
- `IconDefinitionError`.

Its public type surface comprises:

- `CollectionApi`, `CollectionDefinition`, `CollectionIdentity`, and `CollectionMetadata`;
- `IconApi`, `IconDefinition`, `IconIdentity`, `IconViewBox`, and `IconMetadata`;
- `IconPoint`, `IconPathNode`, `IconCircleNode`, `IconEllipseNode`, `IconRectNode`,
  `IconLineNode`, `IconPolylineNode`, `IconPolygonNode`, and `IconNodeType`;
- `IconPresentation`, `IconPresentationPolicy`, `IconPaintType`, `IconFillRuleType`,
  `IconStrokeLineCapType`, `IconStrokeLineJoinType`, and `IconPresentationOverrideType`;
- `IconRenderOptions`, `IconDirectionType`, and `IconRtlPolicyType`.

Internal factories, normalisers, and validators are emitted as implementation modules but cannot
be resolved through the package export map. `IconDefinitionError` is available only from the root;
its implementation subpath remains unsupported.

## Consumers

| Consumer | Core authority used |
| --- | --- |
| `@aster/icons` | Authors canonical icon and collection definitions. |
| `@aster/svg` | Revalidates definitions and interprets portable render options and presentation authorities. |
| `@aster/build` | Produces and validates portable identities, view boxes, presentation, nodes, definitions, and collections from external source evidence. |
| `@aster/cli` | Describes and normalises catalogue icon and collection records without changing definitions. |
| Repository workflows | Exercise TypeScript-first authoring, import equivalence, and package composition through public roots. |

No consumer grants Core filesystem, DOM, terminal, process, framework, or catalogue-registry
authority.

## Public authority classification

| Public value | Classification | Evidence |
| --- | --- | --- |
| `Icon` and `Collection` | Portable domain authorities | Every canonical definition enters the ecosystem through their frozen `define()` operations. |
| `iconNodeKinds` | Portable domain authority | SVG dispatches portable node kinds through this closed vocabulary. |
| `iconDirections` and `iconRtlPolicies` | Portable domain authorities | SVG resolves direction and RTL behaviour without owning either vocabulary. |
| `iconPaintSchema` | Portable domain authority | Core validation and SVG option normalisation share its accepted paint grammar. |
| `iconPresentationOverrideOrder` | Portable domain authority | Core and SVG require the same deterministic presentation override order. |
| `iconTechnicalPresentation` | Portable domain authority | SVG omits Core-owned technical presentation fields from authored output. |
| `IconDefinitionError` | Portable failure authority | Build and JavaScript consumers can distinguish invalid authored definitions without relying on a private class name. |

Public contracts and types describe the portable data ABI independently of whether every leaf
contract currently has a named external import. Individual geometry contracts remain deliberate
domain vocabulary rather than consumer conveniences. Internal emitted modules remain outside the
supported ABI because the package export map exposes only the root.

No current workflow justifies another immutable API operation. Consumers either define one complete
icon or one complete collection, and none requires incremental membership composition. A future
operation must therefore prove immutable return, duplicate, ordering, ownership, and failure
semantics before it expands the API.

## Distribution snapshot

The accepted baseline emits native ES2022 ESM with one public root export and `sideEffects: false`.
On the accepted revision the unminified distribution contains 72 JavaScript modules totalling
48,345 bytes and 72 declaration files totalling 33,535 bytes. These values are comparison evidence,
not a fixed compatibility promise.

## Risk inventory

| Risk | Evidence | Decision boundary |
| --- | --- | --- |
| Repeated complete icon validation | Collection construction validates every member even when it retains an already deeply frozen canonical icon. | Measure before changing trust or retention semantics; immutability alone must not become unproven provenance. |
| Deep-freeze inspection cost | Collection retention recursively inspects every own data value after constructing an isolated candidate. | Compare traversal cost while preserving protection against shallow freezing, hidden state, cycles, and repeated aliases. |
| API composition ambiguity | `Icon` and `Collection` currently expose only `define()`; names such as `add()` do not state mutation, ownership, duplicate, or ordering semantics. | Require a demonstrated immutable composition workflow before adding an operation. Collection membership remains collection-owned. |
| Definition instance pressure | Canonical definitions are plain deeply frozen data, while instance methods would add prototypes and behaviour to the portable value model. | Keep definitions structural; evaluate explicit immutable API operations before considering a separate value-object representation. |
| Distribution granularity | TypeScript emits one module per source file with no bundling. | Treat file and byte counts as inspection evidence; do not add a bundler without a distribution requirement. |

## Hardened input boundary

Core accepts only plain records with own enumerable string-keyed data fields and dense arrays with
canonical indexed data elements. Runtime evidence covers unknown fields, custom and null
prototypes, symbols, hidden properties, accessors, sparse arrays, authored array properties,
cycles, repeated aliases, mutation isolation, numeric boundaries, Unicode text, ASCII slugs,
relationship invariants, deterministic errors, ordering, and many-to-many collection membership.

Proxy traps and caller-controlled execution remain outside Core's sandbox authority. Their failures
are propagated without being misclassified as `IconDefinitionError`.

No item authorises caching, mutable singletons, global registries, trusted-object branding, or API
growth by itself. Each correction requires conformance evidence or a measured comparison.
