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
| `BenchmarkCatalogueFixtureFactory` | Creates the fixed synthetic icon corpus, collection, and provider snapshot shared by catalogue-sensitive package scenarios. |
| `PackageDistributionInspector` | Reports emitted JavaScript, declarations, bytes, exports, and side-effect metadata. |
| `NodeProcessHost` | Executes one fresh Node process from an explicit repository root and captures complete timing, status and streams. |
| `ModuleImportProbe` | Instruments one emitted package boundary inside a disposable process and records modules whose markers execute. |
| `ModuleImportRunner` | Repeats one public import in fresh processes, validates stable exports and evaluated modules, and summarises process and import timings. |

Closed methodology defaults and emitted-file vocabulary live in shared immutable constants. Narrow
internal contracts describe the host, scenario, and distribution-inspection capabilities. The
distribution inspector receives filesystem, JSON, path, and traversal capabilities explicitly; it
does not construct Node adapters internally.

`benchmarkMethodology` is the shared immutable authority for seven retained samples, 500 warm-up
operations, median high-resolution elapsed nanoseconds per operation, and median non-negative heap
growth after explicit pre-sample collection. Package baselines may define scenario operation counts
but cannot silently redefine those shared report meanings.

`benchmarkCatalogueFixture` fixes the shared synthetic corpus at sixteen definitions. Changing its
scale or construction semantics requires an explicit report schema revision because it invalidates
direct historical comparison. Product icons and collections never serve as benchmark fixtures;
ordinary catalogue growth therefore cannot alter Core, SVG, or CLI operation inputs.

## Internal contracts

| Contract | Responsibility |
| --- | --- |
| `IBenchmarkHost` | Supplies availability checks, explicit garbage collection, monotonic time, heap usage and environment identity. |
| `IBenchmarkScenario` | Describes one named synchronous or asynchronous operation, its sample operation count and checksum result. |
| `IBenchmarkCatalogueFixture` | Carries the representative icon, fixed corpus, complete collection and provider snapshot shared by Core, SVG and CLI fixture factories. |
| `IPackageDistributionInspector` | Reports one emitted package distribution without changing it. |
| `ICoreBaselineFixtures` | Carries prepared canonical and mutable Core icon and collection values outside measured work. |
| `ISvgBaselineFixtures` | Carries prepared definitions and options for primitive, corpus, override, RTL, escaping and point-sequence SVG scenarios. |
| `IImportBaselineFixtures` | Carries prepared accepted, rejected, editor, scale, operation and batch Import values plus explicit sizes. |
| `ICliBaselineFixtures` | Carries the prepared icon, contexts, invocations, argv sequences and command authority used by CLI scenarios. |
| `IProcessHost` | Runs one fresh Node process and returns elapsed time, status and complete streams for package comparison evidence. |

Fixture contracts prevent source acquisition, parsing, catalogue loading and value construction
from entering timed loops accidentally. Package contracts remain baseline-specific, while the
shared synthetic catalogue contract carries only the cross-package values whose identical scale is
deliberate measurement evidence.

## Package runtime composition

| Class family | Responsibility |
| --- | --- |
| `CoreBaselineFixtureFactory`, `SvgBaselineFixtureFactory`, `ImportBaselineFixtureFactory`, `CliBaselineFixtureFactory` | Prepare complete package-specific public values and scale evidence outside timed work. |
| `CoreBaselineFactory`, `SvgBaselineFactory`, `IconsBaselineFactory`, `ImportBaselineFactory`, `CliBaselineFactory` | Compose fresh package runners from shared repository and benchmark capabilities. |
| `CoreBaselineRunner`, `SvgBaselineRunner`, `IconsBaselineRunner`, `ImportBaselineRunner`, `CliBaselineRunner` | Own each package's independent scenario matrix and frozen report envelope. |
| `CliColdStartRunner` | Repeats cold root-import and executable scenarios, validates their exact process contract and summarises timings. |
| `CliCommandEvaluationProbe` | Instruments emitted CLI and Icons modules while executing one real built-in catalogue workflow in a disposable process. |
| `CliCommandEvaluationRunner` | Repeats built-in workflows in fresh processes and rejects unstable command results or evaluated-module sets. |

Each package owns an independent runner, factory, command and scenario matrix. Baselines reuse
shared capabilities without a global scenario registry or another package baseline's configuration.

The shared process host exists because CLI cold-start, CLI built-in command evaluation, and Icons
module-evaluation evidence require isolated Node processes. CLI owns its command workflows and
instrumentation because their semantics cross its provider integration boundary; Icons owns its
public specifier scenarios while the shared import runner and disposable probe own generic import
measurement.

Baseline runners freeze their report envelope and scenario lists, but retain injected environment,
measurement and distribution evidence by reference. The default collaborators produce stable
evidence; custom collaborators own their nested values. The distribution inspector freezes its
summary and lexically ordered copies of manifest records, not arbitrary nested JSON values.
Prepared mutable Core fixtures remain mutable by design so the corresponding scenarios measure
construction from non-canonical input.

## Package comparisons

Each command builds its package and required workspace dependencies, then prints one JSON report
without writing an artefact. Measured operations use fixtures prepared outside timed work;
operation baselines run with explicit garbage-collection access. Icons instead measures imports
in fresh processes.

| Command | Workload owner |
| --- | --- |
| `pnpm benchmark:core` | [Core baseline](../../packages/core/quality-baseline.md): canonical/mutable construction and alias dictionaries. |
| `pnpm benchmark:icons` | [Icons baseline](../../packages/icons/quality-baseline.md): isolated definitions, manifest and dynamic imports. |
| `pnpm benchmark:svg` | [SVG baseline](../../packages/svg/quality-baseline.md): public rendering and presentation overrides. |
| `pnpm benchmark:cli` | [CLI baseline](../../packages/cli/quality-baseline.md): shell adaptation, commands, startup and module evaluation. |
| `pnpm benchmark:import` | [Import baseline](../../packages/import/quality-baseline.md): inspection, definition, emission, adoption and rejection. |

Each linked baseline owns exact scenarios, fixture sizes, distribution evidence, interpretation
and package-specific acceptance rules. Shared tooling owns methodology and execution only.

## Comparison limits

Timing and heap pressure vary with runtime revision, machine, power state, and background load.
Reports are compared only under equivalent conditions and never replace correctness tests.
Distribution byte counts are unminified compiler output, not bundle-size guarantees.

The tooling remains outside package manifests and public APIs. Deterministic tests inject a fake
clock, heap readings, and garbage-collection capability to verify exact aggregation. Distribution
inspection uses an isolated temporary package fixture rather than a real workspace output. Real
wall-clock measurements remain informative development commands and never become repository pass
thresholds.
