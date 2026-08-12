# Core Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@aster/core` construction and
distribution changes. It is not a product benchmark, a hardware-independent promise, or a CI
performance threshold.

Current findings remain in [Core Quality](quality.md).

## Representative evidence

The baseline uses canonical public APIs and the current `@aster/icons` pilot rather than Core
implementation classes or synthetic private contracts.

| Workload | Evidence | Pressure represented |
| --- | --- | --- |
| Icon construction | Round-robin `Icon.define()` over all pilot icons. | Structurally varied definitions, geometry validation, presentation normalisation, cloning, and deep freezing. |
| Collection construction | `Collection.define()` over the complete pilot collection. | Sixteen-member icon validation, uniqueness, ordering, retention, and collection freezing. |

Runtime suites remain the correctness authority for malformed values, numeric boundaries,
canonical ordering, isolation, deep freezing, and deterministic failures. A benchmark never
replaces a conformance test.

## Reproduction

Run the development-only comparison from a clean workspace:

```sh
pnpm benchmark:core
```

The command builds only Core and the real Icons corpus before running Node with explicit
garbage-collection access. It prints JSON to standard output and writes no artefact. The report
contains:

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

Generic measurement, Node-host, and package-distribution classes live in shared repository
performance tooling. The Core runner owns only Core scenarios and fixture selection. A future
package baseline must provide an independent package runner and may reuse the shared measurement
infrastructure without adding its scenarios to the Core command.

Neither layer is shipped by Core, Icons, SVG, Build, or CLI. Raw reports are intentionally not
committed because they are machine-specific and reproducible from the source revision.
