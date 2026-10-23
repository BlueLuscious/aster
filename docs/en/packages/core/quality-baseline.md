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

The complete sixteen-member scenarios revalidate a definition containing both `icons` and
`members`. The authored dictionary scenarios derive `members` without validating a submitted
sequence. Their different trust-boundary work makes them unsuitable for a direct per-member
timing comparison. All dictionary views retain canonical icon references when validation permits;
the benchmark never times repeated property access as collection construction.

Schema six marks grouped collection construction. See the shared
[workload comparison limits](../../tooling/performance/index.md#structure).

## Current Construction Reference

A Windows x64 reference uses Node `24.10.0`, V8 `13.6`, TypeScript `5.9.3` and ES2022 ESM.
Values below are medians of three worker medians, each retaining seven samples with operation
counts calibrated once before comparison. Preparation and complete-output fingerprints are
outside timing; result-array construction and checksum consumption are inside. Filesystem caches,
scheduling, thermals and antivirus are uncontrolled. These are local observations, not budgets.

| Complete construction workload | Median |
| --- | ---: |
| One collection, 100 canonical definitions | 0.157 ms |
| One collection, 1,000 canonical definitions | 1.657 ms |
| One collection, 10,000 canonical definitions | 22.517 ms |
| 1,000 collections, ten shared canonical definitions each | 19.245 ms |

The last row constructs 10,000 membership references to ten distinct definitions. Roots,
metadata, groups and flat member lists are rebuilt in each operation. These figures do not
measure repeated member reads, rendering or fresh module imports.

Supplemental fixtures cover 1/10/100/1,000/10,000 definitions; canonical, mutable, shallow,
structured and JSON copies; genuinely separate compatible Core outputs; empty/populated
collections; 1/3/10 treatments; shared/disjoint selections; geometry and metadata width; and
submitted-member rejection. These are finite development strata, not a Cartesian product or
public size limits. Reproduce the axes with `BenchmarkCatalogueFixtureFactory.createScaled()`
and explicit ownership inputs under the
[supplemental protocol](../../tooling/performance/index.md#supplemental-measurements).
The standard command below runs only the fixed twelve-scenario matrix.

## Reuse and Input Ownership

The [definition runtime](definition/runtime/index.md#recognised-outputs) owns recognised versus
unknown input, including [reuse and external preparation](definition/runtime/index.md#reusing-definitions).
The [collection runtime](collection/index.md#runtime) owns membership construction and revalidation.
Keep those workloads distinct: repeated construction is not ordinary member access or a downstream
render.

Resource observations follow the [shared methodology](../../tooling/performance/index.md#processes-and-resources).
Complete-program costs belong to the
[integrated reference](../../tooling/performance/index.md#integrated-consumer-observations).

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

[Shared comparison rules](../../tooling/performance/index.md#comparison-limits) govern sampling,
claim thresholds, accepted trade-offs and distribution growth. Core correctness, diagnostics,
ordering, isolation and deep immutability remain authoritative.

## Tooling boundary

The [performance composition](../../tooling/performance/index.md#package-runtime-composition)
owns private factories, runners and shared host capabilities. Core's baseline selects only Core
fixtures and scenarios. None of that tooling ships in the package; machine-specific raw reports
are reproducible disposable evidence, not committed artefacts.
