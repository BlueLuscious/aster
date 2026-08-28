# Core Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@aster/core` construction and
distribution changes. It is not a product benchmark, a hardware-independent promise, or a CI
performance threshold.

Current findings remain in [Core Quality](quality.md).

## Representative evidence

The baseline uses public APIs and the current `@aster/icons` pilot rather than Core implementation
classes or synthetic private contracts. All mutable clones and collection variants are prepared
before timing begins.

| Workload | Evidence | Pressure represented |
| --- | --- | --- |
| Mutable icon construction | Round-robin `Icon.define()` over mutable clones of all pilot icons. | Structurally varied authored input, geometry validation, presentation normalisation, reconstruction, and deep freezing. |
| Canonical icon construction | Round-robin `Icon.define()` over the canonical frozen pilot icons. | Complete revalidation and independent reconstruction of already canonical definitions. |
| Empty collection construction | `Collection.define()` over a valid collection with no members. | Fixed collection validation, identity, metadata, allocation, and freezing cost. |
| Single canonical member | `Collection.define()` over one canonical frozen pilot icon. | Per-member revalidation, duplicate identity, canonical comparison, and retention cost. |
| Complete mutable collection | `Collection.define()` over mutable clones of all sixteen pilot icons. | Complete member reconstruction and duplicate detection without canonical identity retention. |
| Complete canonical collection | `Collection.define()` over the canonical sixteen-member pilot collection. | Complete revalidation, canonical comparison, identity retention, ordering, and collection freezing. |

Mutable and canonical variants are structurally equivalent. Their comparison distinguishes input
state and retention pressure; it does not grant provenance or permit a validation shortcut.

## Investigation baseline

Three complete reports captured under the same Node, operating-system, architecture, hardware,
scenario, and workspace conditions produced these medians across report medians:

| Scenario | Median elapsed time |
| --- | ---: |
| `core.icon.define.mutable` | 11,703 ns per operation |
| `core.icon.define.canonical` | 10,156 ns per operation |
| `core.collection.define.empty` | 1,749 ns per operation |
| `core.collection.define.single-canonical` | 18,231 ns per operation |
| `core.collection.define.complete-mutable` | 159,086 ns per operation |
| `core.collection.define.complete-canonical` | 203,794 ns per operation |

Canonical icon input is not intrinsically slower than equivalent mutable input in this matrix.
The complete canonical collection is approximately 28% slower than its equivalent mutable-member
variant, which demonstrates measurable canonical-retention pressure but does not identify the
responsible method by itself. CPU attribution must separate reconstruction, duplicate detection,
graph comparison, and collection freezing before an implementation experiment is accepted.

Runtime suites remain the correctness authority for malformed values, numeric boundaries,
canonical ordering, isolation, deep freezing, and deterministic failures. A benchmark never
replaces a conformance test.

## Attributed investigation outcome

CPU profiles from four material scenarios across three runs each separated common strict
inspection from canonical-retention work. Complete mutable and canonical collections both spend
material time validating exact fields, property descriptors, and dense arrays. Only the canonical
scenario materially exercises `CanonicalIconMatcher`, where recursive graph comparison accounted
for a median 20.66% of self-time. Duplicate detection, identity-key construction, and freezing did
not present independent material self-time.

The selected experiment changed only matcher traversal. Three fresh control and three candidate
reports produced these medians across report medians:

| Scenario | Recursive control | Iterative candidate | Difference |
| --- | ---: | ---: | ---: |
| `core.icon.define.mutable` | 11,923 ns | 11,419 ns | 4.23% faster |
| `core.icon.define.canonical` | 9,996 ns | 10,122 ns | 1.26% slower |
| `core.collection.define.empty` | 1,736 ns | 1,769 ns | 1.90% slower |
| `core.collection.define.single-canonical` | 17,865 ns | 17,656 ns | 1.17% faster |
| `core.collection.define.complete-mutable` | 159,200 ns | 160,777 ns | 0.99% slower |
| `core.collection.define.complete-canonical` | 208,472 ns | 212,604 ns | 1.98% slower |

The candidate preserved the complete runtime, type, and ABI conformance surface, but it failed the
10% target improvement rule and made the target scenario slower. Its lower observed heap pressure
did not justify retaining additional traversal state when elapsed time remained the declared
target. The implementation was restored exactly, so these results document a rejected mechanism
rather than a distribution change or performance promise.

## Reproduction

Run the development-only comparison from a clean workspace:

```sh
pnpm benchmark:core
```

The command builds only Core and the real Icons corpus before running Node with explicit
garbage-collection access. It prints schema-version-two JSON to standard output and writes no
artefact. The report contains:

- Node, operating-system, and architecture identity;
- seven independently timed samples after an untimed warm-up;
- minimum, median, and maximum elapsed nanoseconds per public API operation;
- median non-negative heap growth per operation after pre-sample garbage collection;
- a deterministic checksum proving that scenario results were consumed;
- emitted Core module and declaration counts and bytes;
- Core manifest export keys and its `sideEffects` declaration.

Heap growth is a pressure indicator, not an exact allocation counter. Garbage-collector scheduling,
processor power state, background load, and Node revisions can affect timing and memory. Reports
are comparable only when those conditions and scenario configuration are equivalent.

## Acceptance rules

Correctness takes precedence over performance. A correction may proceed without a speed-up, but it
must preserve every unrelated conformance guarantee.

A performance claim is accepted only when:

- the target scenario improves by at least 10% in the median across three separate command runs on
  both the baseline and candidate revisions;
- no unrelated scenario regresses by more than 5% without an explicit accepted trade-off;
- a memory claim meets the same 10% median rule and is described as heap pressure rather than exact
  allocations;
- diagnostics, ordering, isolation, and deep immutability remain unchanged unless the change is
  itself an accepted correction;
- emitted-size changes are reported and any increase has a concrete responsibility rather than a
  cosmetic abstraction.

A demonstrated pathological scaling case may justify work without meeting a percentage threshold,
provided a deterministic fixture exposes the scaling behaviour and the correction removes it.

## Tooling boundary

Generic measurement, statistics, Node-host, and package-distribution classes live in shared
repository performance tooling. The Core factory composes those capabilities, while the Core runner
owns only Core scenarios and fixture selection. A future package baseline must provide an
independent factory, runner, and command; it may reuse shared measurement infrastructure without
adding its scenarios to the Core command or importing Core configuration.

Neither layer is shipped by Core, Icons, SVG, Import, or CLI. Raw reports are intentionally not
committed because they are machine-specific and reproducible from the source revision.
