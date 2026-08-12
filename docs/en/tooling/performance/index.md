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
| `BenchmarkRunner` | Applies warm-up, repeated samples, medians, ranges, heap-pressure summaries, and checksums. |
| `PackageDistributionInspector` | Reports emitted JavaScript, declarations, bytes, exports, and side-effect metadata. |

Each package owns an independent runner and command. `CoreBaselineRunner` defines only Core icon and
collection construction scenarios. A future SVG, Build, CLI, or other baseline may reuse shared
runtime classes but cannot add its scenarios to the Core runner.

## Core comparison

Run:

```sh
pnpm benchmark:core
```

The command builds Core and its real Icons corpus, runs Node with explicit garbage-collection
access, prints one JSON report, and writes no artefact. Exact scenarios, interpretation, and
acceptance rules are defined by the
[Core Quality Baseline](../../packages/core/quality-baseline.md).

## Comparison limits

Timing and heap pressure vary with runtime revision, machine, power state, and background load.
Reports are compared only under equivalent conditions and never replace correctness tests.
Distribution byte counts are unminified compiler output, not bundle-size guarantees.

The tooling remains outside package manifests and public APIs. Future hardening adds deterministic
aggregation tests through injected fake host capabilities rather than making wall-clock performance
a repository pass condition.
