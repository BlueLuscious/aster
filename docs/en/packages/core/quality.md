# Core Quality

Status: **Accepted Baseline**

This document inventories the observable `@aster/core` boundary and its current hardening risks.
The measurement method is the [Core Quality Baseline](quality-baseline.md).

## Public inventory

The package exposes only the root subpath. Its runtime values are:

- `Collection` and `Icon`;
- `iconDirections` and `iconRtlPolicies`;
- `iconNodeKinds`;
- `iconPaintSchema`, `iconPresentationEnumerations`,
  `iconPresentationOverrideOrder`, and `iconTechnicalPresentation`.

Its public type surface comprises:

- `CollectionApi`, `CollectionDefinition`, `CollectionIdentity`, and `CollectionMetadata`;
- `IconApi`, `IconDefinition`, `IconIdentity`, `IconViewBox`, and `IconMetadata`;
- `IconPoint`, `IconPathNode`, `IconCircleNode`, `IconEllipseNode`, `IconRectNode`,
  `IconLineNode`, `IconPolylineNode`, `IconPolygonNode`, and `IconNodeType`;
- `IconPresentation`, `IconPresentationPolicy`, `IconPaintType`, `IconFillRuleType`,
  `IconStrokeLineCapType`, `IconStrokeLineJoinType`, and `IconPresentationOverrideType`;
- `IconRenderOptions`, `IconDirectionType`, and `IconRtlPolicyType`.

Internal factories, normalisers, validators, and `IconDefinitionError` are emitted as implementation
modules but cannot be resolved through the package export map.

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
| `iconPresentationEnumerations` | Unresolved public exposure | Core derives closed presentation types and performs validation from it, but no current external runtime consumer imports the value. |

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
On the baseline revision the unminified distribution contains 71 JavaScript modules totalling
45,880 bytes and 71 declaration files totalling 33,322 bytes. These values are comparison evidence,
not a fixed compatibility promise.

## Risk inventory

| Risk | Evidence | Decision boundary |
| --- | --- | --- |
| Repeated complete icon validation | Collection construction validates every member even when it retains an already deeply frozen canonical icon. | Measure before changing trust or retention semantics; immutability alone must not become unproven provenance. |
| Frozen-input retention boundary | Exact-field validation and deep-freeze inspection currently traverse enumerable string properties, while a deeply frozen authored object may also contain symbols or non-enumerable values. | Prove that collection construction never retains unsupported hidden fields or mutable hidden aliases before preserving the retention shortcut. |
| Deep-freeze inspection cost | Collection retention recursively inspects every nested enumerable value after constructing an isolated candidate. | Compare traversal cost only after the retention boundary is correct and preserve protection against shallowly frozen authored input. |
| Adversarial object coverage | Current tests cover ordinary unknown fields, prototypes, mutation isolation, numeric boundaries, and deep freezing, but not the complete symbol, non-enumerable, accessor, proxy, cycle, and sparse-array matrix. | Add focused JavaScript boundary evidence without claiming that Core is an execution sandbox. |
| API composition ambiguity | `Icon` and `Collection` currently expose only `define()`; names such as `add()` do not state mutation, ownership, duplicate, or ordering semantics. | Require a demonstrated immutable composition workflow before adding an operation. Collection membership remains collection-owned. |
| Definition instance pressure | Canonical definitions are plain deeply frozen data, while instance methods would add prototypes and behaviour to the portable value model. | Keep definitions structural; evaluate explicit immutable API operations before considering a separate value-object representation. |
| Unused public presentation enumeration | `iconPresentationEnumerations` has no current external runtime consumer even though related Core types and normalisers use it internally. | Retain, internalise, or replace its public role only through an explicit ABI decision. |
| Error discrimination crosses the package boundary | Build currently identifies rejected Core definitions through the private error name, while JavaScript consumers cannot import a stable discriminator. | Decide whether to expose a narrow failure contract or remove the consumer's dependency on an implementation class name. |
| Distribution granularity | TypeScript emits one module per source file with no bundling. | Treat file and byte counts as inspection evidence; do not add a bundler without a distribution requirement. |

No item authorises caching, mutable singletons, global registries, trusted-object branding, or API
growth by itself. Each correction requires conformance evidence or a measured comparison.
