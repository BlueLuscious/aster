# Core Quality

Status: **Accepted**

This document inventories the observable `@aster/core` boundary, records accepted consumer and
distribution conformance, and identifies pressures that do not currently justify API or runtime
growth. The measurement method is the [Core Quality Baseline](quality-baseline.md).

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
Before the canonical-retention correction, the unminified distribution contained 72 JavaScript
modules totalling 48,345 bytes and 72 declaration files totalling 33,535 bytes. The current
distribution includes the dedicated matcher responsibility and contains 73 JavaScript modules
totalling 50,270 bytes and 73 declaration files totalling 34,366 bytes. These values are comparison
evidence, not a fixed compatibility promise.

## Performance comparison

Three baseline and three candidate reports were captured under the same Node, operating-system,
architecture, hardware, scenario, and workspace conditions. The median across report medians was:

| Scenario | Hardened baseline | Retained candidate | Difference |
| --- | ---: | ---: | ---: |
| `core.icon.define` | 11,118 ns per operation | 11,540 ns per operation | 3.8% slower |
| `core.collection.define` | 222,683 ns per operation | 197,876 ns per operation | 11.1% faster |

The candidate removes a redundant dense-array pass, combines collection normalisation with
duplicate detection, and replaces independent freezing inspection with one canonical graph
comparison. It also corrects retention of frozen but non-canonical input. Checksums and observable
construction semantics remain unchanged.

Heap observations did not meet the accepted improvement threshold, so no memory reduction is
claimed. The correction changes constant traversal work rather than algorithmic complexity; no
scaling claim or CI threshold follows from this evidence.

## Focused performance investigation

The granular six-scenario matrix subsequently isolated mutable and canonical icon construction,
fixed collection overhead, single-member retention, and complete mutable and canonical
collections. Three equivalent reports established the investigation baseline documented in
[Core Quality Baseline](quality-baseline.md).

CPU attribution identified strict field, descriptor, and dense-array inspection as essential work
shared by mutable and canonical inputs. `CanonicalIconMatcher` accounted for a median 20.66% of
self-time in complete canonical collection profiles and did not appear in the equivalent mutable
scenario. Duplicate detection, identity-key construction, and freezing were not independent
material hotspots.

One controlled candidate replaced recursive authored-to-canonical correspondence with iterative
stack traversal and authored-object visitation. It preserved exact values, field order,
prototypes, frozen state, repeated-alias and cycle rejection, and canonical member identity. The
median complete canonical collection result across three fresh reports changed from 208,472 to
212,604 nanoseconds per operation, a 1.98% regression. Although observed heap pressure decreased,
the candidate failed the accepted timing threshold and was reverted completely.

Core therefore retains its existing implementation. The observed canonical-retention cost is a
bounded consequence of complete semantic validation and identity-safe graph comparison, not an
unfinished correction. Further work requires a new measured mechanism that preserves the same
trust boundary; caching, branding, registries, mutable memoisation, and frozen-only shortcuts
remain unacceptable substitutes for evidence.

## Future pressure boundaries

| Pressure | Current evidence | Decision boundary |
| --- | --- | --- |
| Repeated complete icon validation | Collection construction still validates every member before canonical identity retention. | Retain this cost unless a future security model proves provenance without branding, registries, caches, or hidden state. |
| Canonical graph comparison | Collection compares a successfully reconstructed member with frozen authored data before retaining object identity; focused profiling attributes material canonical-only cost to this responsibility. | Preserve exact values, key order, prototypes, topology, and adversarial protections. Reopen only with a distinct measured mechanism and equivalent reports. |
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

No pressure authorises caching, mutable singletons, global registries, trusted-object branding, or
API growth by itself. Any future correction requires conformance evidence or a measured
comparison.

## Accepted conformance

- Icons author definitions and collection membership only through public Core construction.
- SVG revalidates portable definitions, consumes exported runtime vocabularies, and owns SVG,
  accessibility-resolution, and target-error semantics independently.
- Build creates Core values through the public root and owns parsing, source diagnostics,
  normalisation, generation, and filesystem-host separation independently.
- CLI isolates provider values through public Core construction while keeping catalogue identity,
  membership evidence, search, provenance, and discovery state outside Core.
- Built package declarations and modules contain no reverse package dependency, Node or DOM type,
  CommonJS output, repository-tooling import, or implementation-subpath dependency.
- Repository workflows exercise TypeScript-first authoring, SVG import equivalence, collection
  composition, and SVG hand-off through built public package roots.

These guarantees are verified by package runtime and ABI suites, CLI clean-consumer and executable
conformance, architecture checks, and repository workflow tests. They describe implemented
relationships only and do not simulate future framework or target adapters.
