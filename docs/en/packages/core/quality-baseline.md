# Core Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@luscious-garden/aster-core` construction and
distribution changes. It is not a product benchmark, a hardware-independent promise, or a CI
performance threshold.

[Core Quality](quality.md) owns correctness and consumer conformance. Shared sampling and report
aggregation are specified by [Performance Tooling](../../tooling/performance/index.md#structure).

## Representative evidence

The schema-version-six baseline uses public Core APIs and a fixed sixteen-definition synthetic
geometry corpus rather than Core implementation classes or product artwork. Scale scenarios
reuse that geometry under unique identities in dictionaries of 26 and 256 icons. All canonical
values, mutable clones and collection variants are prepared before timing begins.

| Workload | Evidence | Pressure represented |
| --- | --- | --- |
| Mutable icon construction | Round-robin `Icon.define()` over mutable clones of the fixed corpus. | Structurally varied authored input, geometry validation, presentation normalisation, reconstruction, and deep freezing. |
| Canonical icon acceptance | Round-robin `Icon.define()` over the canonical fixed corpus. | Public acceptance of exact canonical outputs under the loaded Core implementation. |
| Straight path construction | `Icon.define()` over one two-command open path. | Fixed structured-command and contour-start validation cost. |
| Curved path construction | `Icon.define()` over cubic, quadratic and arc geometry. | Named control, radius, rotation and arc-flag validation cost. |
| Compound path construction | `Icon.define()` over two independently closed contours. | Command ordering, repeated contour transitions and closure validation cost. |
| Empty collection construction | `Collection.define()` over a valid collection with no members. | Fixed collection validation, identity, metadata, allocation, and freezing cost. |
| Single canonical member | `Collection.define()` over one canonical frozen synthetic icon. | Member acceptance, duplicate identity and retention cost. |
| Complete mutable collection | `Collection.define()` over mutable clones of all sixteen synthetic icons. | Complete member reconstruction and duplicate detection without canonical identity retention. |
| Complete canonical collection | `Collection.define()` over the canonical sixteen-member synthetic collection. | Container revalidation, member acceptance, identity retention, ordering and collection freezing. |
| Representative mutable dictionary | `Collection.define()` over an authored dictionary containing 26 mutable synthetic icons, without a submitted `members` list. | Alias validation, complete icon reconstruction, duplicate detection, and one-time member derivation. |
| Representative canonical dictionary | `Collection.define()` over the equivalent 26-member authored dictionary with canonical frozen icons. | Canonical retention, alias validation, ordering, and one-time member derivation. |
| Large canonical dictionary | `Collection.define()` over an authored dictionary containing 256 distinct canonical synthetic icons. | Construction scaling with fixed geometry complexity and unique identities. |

Mutable and canonical variants are structurally equivalent. Their comparison distinguishes input
state and retention pressure; fixture freezing itself grants no trust. The
[definition runtime](definition/runtime/index.md#recognised-outputs) owns exact-output recognition.
The three path scenarios provide complexity-specific evidence and do not use product artwork.

The canonical-output comparison below measures recognition with unchanged public workload calls,
fixed corpus and report schema. Earlier comparisons retain their original input and implementation
scope; their timings must not be reinterpreted as evidence for later behaviour.

The complete sixteen-member scenarios revalidate a definition containing both `icons` and
`members`. The authored dictionary scenarios derive `members` without validating a submitted
sequence. Their different trust-boundary work makes them unsuitable for a direct per-member
timing comparison. All dictionary views retain canonical icon references when validation permits;
the benchmark never times repeated property access as collection construction.

Schema six marks grouped collection construction. See the shared
[workload comparison limits](../../tooling/performance/index.md#structure).

## Canonical-output recognition comparison

On 15 October 2026, fresh isolated builds of source revisions
[`8a8e9ad`](https://github.com/BlueLuscious/aster/commit/8a8e9ad5a1ddd85b1af2bfb48cc57aa2c45fbd1b)
and [`966225e`](https://github.com/BlueLuscious/aster/commit/966225eea453507af5bf7fa16497ebfa8413ed9c)
were compared using Node `24.10.0`, TypeScript `5.9.3`, ES2022 ESM and Windows x64 `10.0.26200`
on an AMD Ryzen 9 6900HX with sixteen logical processors. These are source comparisons, not
measurements of named npm releases. Desktop power and background activity were not lab-controlled.

Five matched control/candidate report pairs alternated execution order without concurrent
verification. Both revisions used the existing [shared sampling method](../../tooling/performance/index.md#structure),
scenario sizes and prepared inputs. Every report contributed; all checksums matched. Values are
medians of five report medians, with their minimum/maximum, in ns per public operation.

| Workload | Control median (range) | Recognition median (range) |
| --- | ---: | ---: |
| Mutable icon | 9,894 (9,637-10,108) | 10,702 (10,486-10,799) |
| Canonical icon | 8,915 (8,501-9,045) | 17 (17-28) |
| Straight path | 8,399 (7,877-8,543) | 9,268 (8,754-9,621) |
| Curved path | 12,110 (11,551-12,954) | 12,388 (12,176-12,928) |
| Compound path | 13,192 (12,841-14,437) | 13,818 (13,278-15,868) |
| Empty collection | 1,964 (1,719-1,990) | 1,993 (1,829-2,071) |
| Single canonical member | 13,276 (11,905-13,614) | 2,433 (2,294-2,954) |
| Complete mutable collection, 16 | 360,002 (343,634-369,009) | 372,607 (366,348-378,741) |
| Complete canonical collection, 16 | 413,789 (392,290-435,376) | 13,755 (12,590-13,968) |
| Mutable dictionary, 26 | 289,378 (257,480-300,091) | 265,521 (256,873-273,347) |
| Canonical dictionary, 26 | 352,853 (344,358-360,892) | 16,849 (14,105-17,326) |
| Canonical dictionary, 256 | 3,459,116 (3,403,800-4,557,340) | 170,816 (157,960-183,520) |

Canonical acceptance improved by 99.81%, consistently across all five pairs, exceeding both 10%
and twice its 6.10% control spread. The nearly empty recognised-reference loop is JIT-sensitive,
not a universal lookup-time promise. Complete and representative canonical collections improved
by 96.68% and 95.22%; collection roots, aliases, duplicate detection and submitted-member checks
still execute. [SVG's comparison](../svg/quality-baseline.md#canonical-output-acceptance-comparison)
owns end-to-end rendering results rather than inferring them from this acceptance-only loop.

### Unknown-input costs

The retained design includes an explicitly accepted trade-off: fresh mutable construction was
8.17% slower, approximately 0.81 microseconds per operation, with a regression in every pair.
Straight-path construction was 10.35% slower in this runner; a separate matched diagnostic gave
1.46%, showing sensitivity to call shape rather than proving that the original cost disappeared.
Complete mutable collection construction rose 3.50%, within its 7.05% control spread.

Supplemental loops reused the existing SVG minimal-circle and 128-point fixtures, with genuinely
independent Core packages and JSON-decoded inputs prepared before timing. They used the same
runner, with 2,000/500 Core operations per sample for minimal/dense geometry. These call shapes
are compared within their own rows, not subtracted from the main runner's timings:

| Supplemental Core input | Minimal control -> recognition | Dense control -> recognition |
| --- | ---: | ---: |
| Foreign output | 6,143 -> 7,336 ns | 77,814 -> 78,427 ns |
| Prepared JSON data | 6,205 -> 6,580 ns | 76,172 -> 83,329 ns |

Small foreign acceptance regressed in every pair, by 19.42% at the report-median level; this is
about 1.19 microseconds, not a special foreign-copy fee. Both kinds of unknown input still undergo
complete construction plus membership lookup and final-output registration. JSON controls had
overlapping report ranges and mixed paired directions. Neither freezing nor a matching identity
grants recognition. [Preparing an external definition](definition/runtime/index.md#preparing-external-definitions)
can amortise construction only when the caller retains a result recognised by its consumer.

### Distribution, heap and first use

Core retained 88 JavaScript modules and 88 declarations. Emitted bytes rose from 65,970/46,892 to
67,083/47,178 respectively, including comments. Public fields, exports, dependencies and side-effect
metadata did not change. The concrete responsibility is private weak output membership and
reference-based collection shortcuts, not a second validation or caching framework.

Sampled heap growth was mixed: the representative canonical dictionary fell from 56,801 to
13,229 bytes/op, while the large canonical dictionary rose from 87,763 to 180,272 and the complete
mutable collection from 2,045 to 15,288. End-of-sample deltas do not count exact allocations or
retained live memory; no general memory-reduction claim follows. The registry's weak lifetime
is a separate [construction invariant](definition/runtime/index.md#recognised-outputs).

Three alternating batches of seven fresh processes per case separated import, first operation
and complete process time, without warm-up. First construction batch medians were 1.148 -> 1.197 ms;
complete process medians were 101.968 -> 101.402 ms. Initial use was not established as a material
improvement or regression. This measures fresh process/module use, not an OS cold-filesystem cache.

The main table is reproducible with the [Core command](#reproduction) on matched builds of both
source revisions. Unknown-input and first-use controls supplement that command; they are not new
report fields, scenarios or CI thresholds. Preserve their preparation/timing separation when
repeating them rather than treating the main command as a foreign-copy or startup measurement.

## Grouped collection construction

On 16 October 2026, three matched control/candidate report pairs alternated execution order on
Windows x64 with Node `24.10.0`, TypeScript `5.9.3` and ES2022 ESM. The control was source
`92dffff`; the candidate used required treatments and grouped membership. Both retained private
canonical-output recognition and the same synthetic geometry and member counts.

| Construction workload | Flat control, schema five | Grouped candidate, schema six |
| --- | ---: | ---: |
| One canonical member | 2,372 ns/op | 3,384 ns/op |
| Complete canonical collection, 16 members | 12,644 ns/op | 29,957 ns/op |
| Authored canonical dictionary, 26 members | 17,075 ns/op | 36,412 ns/op |
| Authored canonical dictionary, 256 members | 169,532 ns/op | 359,420 ns/op |

These are medians across report medians, not equivalent structural workloads or an isolated
recognition comparison. Grouped construction validates and freezes treatment dictionaries,
checks family consistency and canonical property names, and derives flat member order. Recognised
leaves still avoid geometry reconstruction. Reuse constructed collections rather than rebuilding
them for every render; these observations do not measure property access or rendering cost.
Desktop background activity was not lab-controlled, and timings remain development evidence,
not CI thresholds or hardware-independent guarantees.

## Typed collection scaling

Three reports captured on 24 September 2026 with Node `24.10.0` on Windows x64 produced these
medians across report medians:

| Scenario | Median elapsed time |
| --- | ---: |
| Empty authored collection | 1,875 ns per operation |
| Representative mutable dictionary, 26 members | 248,329 ns per operation |
| Representative canonical dictionary, 26 members | 314,361 ns per operation |
| Large canonical dictionary, 256 members | 3,311,084 ns per operation |

The large dictionary has approximately 9.85 times as many members and took approximately 10.5
times as long in this comparison. This is bounded near-linear construction evidence for these
fixed inputs, not a hardware-independent complexity or timing guarantee. Geometry complexity,
metadata and input canonicality also affect validation cost. Reading a constructed collection's
`members` remains a data-property access and performs no reconstruction.

## Historical construction comparison

An earlier canonical-retention comparison used three baseline and three candidate reports under
equivalent Node, operating-system, architecture, hardware, scenario and workspace conditions.
These historical inputs predate the current structured-path and typed-collection scenarios.
The median across report medians was:

| Scenario | Hardened baseline | Retained candidate | Difference |
| --- | ---: | ---: | ---: |
| `core.icon.define` | 11,118 ns per operation | 11,540 ns per operation | 3.8% slower |
| `core.collection.define` | 222,683 ns per operation | 197,876 ns per operation | 11.1% faster |

The retained candidate removed a redundant dense-array pass, combined collection normalisation
with duplicate detection, and replaced independent freezing inspection with canonical graph
comparison. It also corrected retention of frozen but non-canonical input. Checksums and
unrelated observable construction semantics remained unchanged.

Heap observations did not meet the improvement threshold, so no memory reduction is claimed.
The correction reduced constant traversal work; it established no scaling claim or CI threshold.

The unminified baseline contained 72 JavaScript modules totalling 48,345 bytes and 72 declaration
files totalling 33,535 bytes. The dedicated matcher candidate contained 73 JavaScript modules
totalling 50,270 bytes and 73 declaration files totalling 34,366 bytes. These are historical
comparison values, not current distribution counts or compatibility promises.

## Investigation baseline

The following schema-version-two findings used the former product pilot and remain historical
investigation evidence; they are not directly comparable with current schema-version-six reports.
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

The command builds only Core before running Node with explicit garbage-collection access. It
prints schema-version-six JSON to standard output and writes no artefact. It reports the
scenario matrix above and the distribution built from the current checkout.
[Performance Tooling](../../tooling/performance/index.md) owns shared report fields, sampling,
heap-pressure interpretation and environmental comparison limits.

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

The [performance composition](../../tooling/performance/index.md#package-runtime-composition)
owns private factories, runners and shared host capabilities. Core's baseline selects only Core
fixtures and scenarios. None of that tooling ships in the package; machine-specific raw reports
are reproducible disposable evidence, not committed artefacts.
