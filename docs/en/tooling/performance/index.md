# Performance Tooling

Status: **Accepted Baseline**

The performance feature supplies development-only comparison evidence. It does not define product
speed guarantees or CI thresholds.

## Structure

Shared performance runtime classes own capabilities that apply to more than one package baseline.
Repository filesystem, path, strict JSON, and deterministic traversal capabilities come from
[Shared Tooling](../shared/index.md):

| Class | Responsibility |
| --- | --- |
| `NodeBenchmarkHost` | Supplies monotonic time, heap usage, explicit garbage collection, and environment identity. |
| `NumericSampleStatistics` | Calculates median, minimum, and maximum observations without mutating samples. |
| `BenchmarkRunner` | Applies warm-up, repeated samples, heap-pressure summaries, checksums, and injected aggregation. |
| `PackageDistributionInspector` | Reports emitted JavaScript, declarations, bytes, exports, and side-effect metadata. |

Closed methodology defaults and emitted-file vocabulary live in shared immutable constants. Narrow
internal contracts describe the host, scenario, and distribution-inspection capabilities. The
distribution inspector receives filesystem, JSON, path, and traversal capabilities explicitly; it
does not construct Node adapters internally.

Each package owns an independent runner, factory, and command. `CoreBaselineFactory` composes the
shared Node capabilities, while `CoreBaselineRunner` defines only Core icon and collection
construction scenarios. A future SVG, Build, CLI, or other baseline creates its own package factory
and runner, reuses shared capabilities, and never edits a global scenario registry or imports Core
configuration.

## Core comparison

Run:

```sh
pnpm benchmark:core
```

The command builds Core and its real Icons corpus, prepares mutable and canonical fixture variants
outside timed loops, runs Node with explicit garbage-collection access, prints one JSON report,
and writes no artefact. Exact scenarios, interpretation, and acceptance rules are defined by the
[Core Quality Baseline](../../packages/core/quality-baseline.md).

## Comparison limits

Timing and heap pressure vary with runtime revision, machine, power state, and background load.
Reports are compared only under equivalent conditions and never replace correctness tests.
Distribution byte counts are unminified compiler output, not bundle-size guarantees.

The tooling remains outside package manifests and public APIs. Deterministic tests inject a fake
clock, heap readings, and garbage-collection capability to verify exact aggregation. Distribution
inspection uses an isolated temporary package fixture rather than a real workspace output. Real
wall-clock measurements remain informative development commands and never become repository pass
thresholds.
