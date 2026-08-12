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

## Distribution snapshot

The accepted baseline emits native ES2022 ESM with one public root export and `sideEffects: false`.
On the baseline revision the unminified distribution contains 71 JavaScript modules totalling
45,880 bytes and 71 declaration files totalling 33,322 bytes. These values are comparison evidence,
not a fixed compatibility promise.

## Risk inventory

| Risk | Evidence | Decision boundary |
| --- | --- | --- |
| Repeated complete icon validation | Collection construction validates every member even when it retains an already deeply frozen canonical icon. | Measure before changing trust or retention semantics; immutability alone must not become unproven provenance. |
| Deep-freeze inspection cost | Collection retention recursively inspects every nested value after constructing an isolated candidate. | Compare traversal cost and preserve protection against shallowly frozen authored input. |
| API composition ambiguity | `Icon` and `Collection` currently expose only `define()`; names such as `add()` do not state mutation, ownership, duplicate, or ordering semantics. | Require a demonstrated immutable composition workflow before adding an operation. Collection membership remains collection-owned. |
| Definition instance pressure | Canonical definitions are plain deeply frozen data, while instance methods would add prototypes and behaviour to the portable value model. | Keep definitions structural; evaluate explicit immutable API operations before considering a separate value-object representation. |
| Broad runtime constant surface | Several schemas and canonical vocabularies are public values required by current Build and SVG consumers. | Audit each value independently; do not hide a real portable authority merely to reduce key count. |
| Error type is intentionally private | JavaScript consumers observe deterministic error fields but cannot import `IconDefinitionError`. | Confirm whether stable failure discrimination needs a public contract without exposing internal construction. |
| Distribution granularity | TypeScript emits one module per source file with no bundling. | Treat file and byte counts as inspection evidence; do not add a bundler without a distribution requirement. |

No item authorises caching, mutable singletons, global registries, trusted-object branding, or API
growth by itself. Each correction requires conformance evidence or a measured comparison.
