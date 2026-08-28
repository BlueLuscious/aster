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
| `BenchmarkConfigurationValidator` | Enforces shared positive operation and sample-count controls. |
| `BenchmarkRunner` | Applies one warm-up, sampling, heap-pressure, checksum, and aggregation methodology to synchronous or asynchronous operations without overlapping samples or scenarios. |
| `PackageDistributionInspector` | Reports emitted JavaScript, declarations, bytes, exports, and side-effect metadata. |

Closed methodology defaults and emitted-file vocabulary live in shared immutable constants. Narrow
internal contracts describe the host, scenario, and distribution-inspection capabilities. The
distribution inspector receives filesystem, JSON, path, and traversal capabilities explicitly; it
does not construct Node adapters internally.

Each package owns an independent runner, factory, and command. `CoreBaselineFactory` composes the
shared Node capabilities, while `CoreBaselineRunner` defines only Core icon and collection
construction scenarios. `SvgBaselineFactory` and `SvgBaselineRunner` independently compose SVG
definitions, options, rendering scenarios, and distribution evidence. `CliBaselineFactory` and
`CliBaselineRunner` independently compose command, shell, cold-process, and distribution evidence.
`ImportBaselineFactory` and `ImportBaselineRunner` independently compose source inspection,
definition, emission, adoption, rejection, batch and distribution evidence. Any other baseline
follows the same isolation, reuses shared capabilities, and never edits a global scenario registry
or imports another package baseline's configuration.

The CLI baseline owns a narrow fresh-process host and runner because cold root import and
executable startup cannot be measured by an in-process operation loop. That adapter remains
CLI-specific until another package demonstrates the same process contract.

## Core comparison

Run:

```sh
pnpm benchmark:core
```

The command builds Core and its real Icons corpus, prepares mutable and canonical fixture variants
outside timed loops, runs Node with explicit garbage-collection access, prints one JSON report,
and writes no artefact. Exact scenarios, interpretation, and acceptance rules are defined by the
[Core Quality Baseline](../../packages/core/quality-baseline.md).

## SVG comparison

Run:

```sh
pnpm benchmark:svg
```

The command builds Core, the real Icons corpus, and SVG before measuring public rendering and
distribution. Exact scenarios, attribution, retained decisions, and acceptance rules are defined
by the [SVG Quality Baseline](../../packages/svg/quality-baseline.md).

## CLI comparison

Run:

```sh
pnpm benchmark:cli
```

The command builds Core, Icons, SVG, and CLI before measuring synchronous shell adaptation,
asynchronous programmatic commands, fresh Node startup, and emitted distribution evidence. Exact
scenarios, attribution, and acceptance rules are defined by the
[CLI Quality Baseline](../../packages/cli/quality-baseline.md).

## Import comparison

Run:

```sh
pnpm benchmark:import
```

The command builds Core and Import, prepares accepted, rejected, editor-export and batch fixtures
outside timed loops, and measures only public Import operations and emitted distribution. Exact
scenarios, fixture sizes, exclusions and interpretation are defined by the
[Import Quality Baseline](../../packages/import/quality-baseline.md).

## Comparison limits

Timing and heap pressure vary with runtime revision, machine, power state, and background load.
Reports are compared only under equivalent conditions and never replace correctness tests.
Distribution byte counts are unminified compiler output, not bundle-size guarantees.

The tooling remains outside package manifests and public APIs. Deterministic tests inject a fake
clock, heap readings, and garbage-collection capability to verify exact aggregation. Distribution
inspection uses an isolated temporary package fixture rather than a real workspace output. Real
wall-clock measurements remain informative development commands and never become repository pass
thresholds.
