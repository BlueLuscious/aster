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
| `BenchmarkEvidence` | Fingerprints complete own-data JSON projections and explicit physical files, detects byte drift and records runtime/machine plus declared environment conditions. |
| `BenchmarkComparisonRunner` | Applies finite rotated baseline/control/candidate orders and checks equivalent work, output, sampling and source identity; retains interrupted comparisons without retries. |
| `BenchmarkWorkspace` | Acquires ownership-marked temporary fixture roots, bounds writes, copies physical distributions and refuses traversal or cleanup through symbolic links. |
| `BenchmarkResourceObserver` | Collects explicitly instrumented CPU, sampled RSS, lifetime RSS high-water marks, post-GC heap and GC-event evidence, separately from latency samples. |

Closed methodology defaults and emitted-file vocabulary live in shared immutable constants. Narrow
internal contracts describe the host, scenario, and distribution-inspection capabilities. The
distribution inspector receives filesystem, JSON, path, and traversal capabilities explicitly; it
does not construct Node adapters internally.

Operation and fresh-process runners reuse `BenchmarkConfigurationValidator` for positive safe
sample counts. Validation occurs during construction, outside measured work; defaults, diagnostics,
report schemas and sampling meanings remain owned by their existing configurations.
CLI command probes accept only own keys from their closed scenario authority before installing
instrumentation; inherited object names are not measurement scenarios.

`benchmarkMethodology` is the shared immutable authority for seven retained samples, 500 warm-up
operations, median high-resolution elapsed nanoseconds per operation, and median non-negative heap
growth after explicit pre-sample collection. Package baselines may define scenario operation counts
but cannot silently redefine those shared report meanings.

`benchmarkCatalogueFixture` fixes the shared synthetic corpus at sixteen definitions. Changing its
scale or construction semantics requires an explicit report schema revision because it invalidates
direct historical comparison. Product icons and collections never serve as benchmark fixtures;
ordinary catalogue growth therefore cannot alter Core, SVG, or CLI operation inputs.

Collection inputs now select explicit nested treatment maps while retaining the same concrete
corpus and flat member order. Core schema six and CLI schema five mark this construction-boundary
change; do not compare their collection-sensitive timings directly with older flat-map reports.
SVG's measured concrete-definition inputs are unchanged. Historical reports retain their scope.

Explicit treatments also lengthen emitted Import modules, CLI JSON and exported filenames. Their
byte-weighted checksums can therefore change without a larger geometry corpus or more operations.
Disclose that output-width boundary when comparing reports; identical checksum units do not imply
identical output sizes. Icons schema two separately adds a named glyph-dictionary import scenario
without redefining the isolated concrete-treatment scenario.

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
| `IBenchmarkScaleOptions` | Declares independent definition, glyph/treatment, selection, geometry, metadata-width and provider axes for supplemental fixtures. |
| `IBenchmarkScaledCatalogueFixture` | Carries canonical/authored inputs, exact selections, coherent providers and actual distinct/reference/geometry counts. |
| `IBenchmarkObservation` | Carries every supplemental operation sample, its frozen operation count, warm-up and units, together with an exact timing summary. |
| `IBenchmarkComparisonEntry` | Associates a supplemental observation with explicit source/artefact, workload and preflight full-output signatures. |

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
| `BenchmarkModuleFixtureFactory` | Produces bounded synthetic concrete-leaf and glyph-dictionary modules through an owned workspace. These are measurement fixtures, not the product Icons generator or distribution. |

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

## Supplemental Measurements

Historical `measure()` results and package schema meanings remain separate from supplemental
schema-one observations. The fixed sixteen-definition authority is unchanged. Supplemental
capabilities are private APIs for workload owners, not published packages or a global scenario
registry. They do not automatically run an extended timing matrix in CI.

`BenchmarkRunner.calibrate()` tests an untouched baseline at 1, 10, 100, 1,000 and 10,000 operations,
selecting the first trial lasting at least 25 ms or the operation cap. It retains every trial and
reports whether the target was reached. Over-five-second trials fail with partial evidence.
A synchronous operation cannot interrupt itself: run calibration in a bounded worker with a
five-second deadline. Freeze the selected count before comparing implementations. Warm-up for
the supplemental runner is `min(count, 20)` complete operations, followed by seven retained samples.
A capped short measurement is not evidence for precise tiny differences.

`observe()` retains elapsed nanoseconds, nanoseconds per operation, non-negative net heap growth
and checksum for every sample. It checks finite observations and stable checksums, retaining
completed samples on handled failures. Hard worker termination can retain only parent-captured
status/streams; unflushed in-memory data is not recoverable. Existing fixed baselines retain their original counts, warm-up,
summary shape and interpretation. Heap growth still does not measure allocation or retained memory.

Prepare values and full output projections outside timed work. Record source/compiled artefacts,
toolchain/dependencies, workload dimensions, geometry, output bytes, flags, lifecycle, cache and
power conditions. `BenchmarkEvidence` hashes explicit data/file sets; its file manifest is not
a hermetic archive of all dependencies. A callable export-shape signature describes names, not
function implementations: record source bytes and verify real outputs independently.

`BenchmarkComparisonRunner.run()` accepts explicit async `baseline`, `control` and `candidate`
capabilities. It runs three rounds in these orders:

1. Baseline, byte-identical control, candidate.
2. Candidate, baseline, control.
3. Control, candidate, baseline.

Each capability returns `IBenchmarkComparisonEntry`. Workload/output signatures, count, warm-up,
sample contract and checksum must agree; source identity must stay stable within each variant,
and control source must equal baseline. Summaries must reproduce the raw samples. A mismatch or
failure stops the comparison and retains preceding results, the offending result where available
and partial observations. No timing threshold, outlier removal or favourable retry is applied.
The caller owns fresh-process execution, scenario-order rotation and equivalent absolute paths.

## Scalable Fixtures

`BenchmarkCatalogueFixtureFactory.createScaled()` prepares independent scale axes through public
Core APIs. `definitions` must divide evenly by `variantsPerGlyph`; no treatment is implicit.
`collections`, `membersPerCollection` and `sharedMembers` select shared initial leaves followed by
disjoint leaves. Insufficient distinct definitions fail rather than silently cycle membership.
Empty collections/catalogues are valid; empty treatment groups and duplicate concrete identities
are not introduced. `nodesPerDefinition`, `pointsPerNode` and `labelWidth` vary geometry and
metadata/output volume independently.

Providers partition definitions; `overlappingDefinitions` exposes the initial definitions in
every provider. A provider also includes all members of its own collections. This closure can add
discovery records: use reported `discoveryRecords`, not an assumed `definitions * providers` count.
`discoveryRecords` counts icon discovery records, including overlaps/member closure; collections
are counted separately. Discovery contains metadata only; exact loaders return the prepared concrete references.
`counts` reports actual distinct definitions/glyphs, treatment shape, collection count, total
membership references, selected distinct definitions, geometry, provider records and label width.

`inputs()` explicitly selects canonical, mutable, shallow-copy, structured-clone, JSON-round-trip
or foreign-Core provenance. Unknown originals are never certified merely for being frozen.
Foreign inputs require a genuinely separate Core copy; `BenchmarkWorkspace.copyPackage()` can
copy a built Core manifest/distribution without sharing its module graph. Dependencies of other
copied packages must be supplied explicitly. Preparation is outside timing unless it is the
named operation.

Fixture limits are development allocation guards, not product acceptance limits: up to 10,000
definitions/collections, ten treatments per glyph, 1,000 nodes per definition, 1,024 points per
node, 1,024 label characters, eight providers and one million total geometry units. Do not run
the Cartesian product. Gate large tiers using a separate smaller resource preflight and the
declared per-workload resource budget; the factory does not authorise an unbounded large run.

## Processes and Resources

`NodeProcessHost.executeBounded()` launches a file-based trusted worker with a 2,048 MiB V8
old-space ceiling, default 120-second deadline and eight-MiB combined raw-output budget. Requests
can reduce time/output/RSS limits; the heap setting stays explicit. It retains nonzero status,
partial streams and abort/cleanup reasons.
Resource-observed workers can send `benchmark.rss` byte observations; values above the configured
ceiling stop the worker. This is an observed-RSS guard, not an OS-enforced RSS quota. Uninstrumented
timings must not install the resource observer to obtain those observations.

Workers must await their non-detached children before normal exit. Deadline/limit cleanup uses
[Windows taskkill tree termination](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill)
or a POSIX process group. This is not a sandbox for malicious or escaping processes. A termination
error invalidates the run; do not discard it or clean files while owned processes may remain.
`BenchmarkWorkspace` independently checks root ownership and containment before writes/removal,
refuses links and limits files/content written through its capability. These are not OS disk
quotas for arbitrary external programs. Keep ownership with the caller so it can clean fixtures
after worker failure; keep probes/reports outside plans and the source tree.

For uninstrumented import observations, run
`tooling/performance/shared/native-module-import-probe.mjs` in a fresh bounded process, passing
one JSON argument such as `{"specifiers":["@luscious-garden/aster-icons/camera/outline"]}`.
It times initial imports through the original specifiers, including their resolution, then times
cached reimports separately. After both windows it validates distinct source URLs and retained
namespace references. Query/hash cache-busting cannot make one source count as several distinct
modules. Duplicate inputs invalidate the run. No preliminary resolution
warms the measured import path. It installs
no module-evaluation hooks. Export shapes/signatures are computed after import timing; whole-worker
elapsed time also includes setup and evidence work. Use the existing instrumented probe separately
for evaluated-module sets. Synthetic leaf/dictionary fixture URLs support distinct multi-module
inputs without adding artwork or public exports.

For large lists, pass `--request <owned-json-file>` instead of inline JSON. The request file is
bounded to eight MiB and acquired before import timing; UTF-8 BOM is accepted. This avoids OS
command-line size limits without measuring cached repetitions as distinct imports. Record the
request file's bytes with other fixture identities. Worker setup/acquisition remains part of the
whole-process measurement, not import-only time.

The multi-input probe performs sequential dynamic imports; it is not a static consumer-module
linking benchmark. Resource mode observes the complete probe, including cached reuse and export
evidence, not just its first-import window. Benchmark static consumers and narrower resource
stages explicitly when those are the workload of interest.

Passing `"resources":true` with `--expose-gc` explicitly selects a separate instrumented resource
run. `BenchmarkResourceObserver` reports CPU microseconds, sampled RSS bytes, OS lifetime max-RSS
before/after, a conservative peak-growth upper bound, post-GC heap and GC events in its window.
The bound can include preparation peaks; samples can miss transients. Returned values remain
strongly referenced when post-GC heap is read. Filesystem counters are OS-reported operations,
not bytes, with platform support limitations. None of these fields is an allocation count or a
leak-freedom claim. Units follow the
[Node process resource API](https://nodejs.org/download/release/v24.10.0/docs/api/process.html#processresourceusage).
Profile/resource instrumentation must remain separate from uninstrumented latency comparisons.

## Comparison limits

Timing and heap pressure vary with runtime revision, machine, power state, and background load.
Reports are compared only under equivalent conditions and never replace correctness tests.
Distribution byte counts are unminified compiler output, not bundle-size guarantees.

The tooling remains outside package manifests and public APIs. Deterministic tests inject a fake
clock, heap readings, and garbage-collection capability to verify exact aggregation. Distribution
inspection uses an isolated temporary package fixture rather than a real workspace output. Real
wall-clock measurements remain informative development commands and never become repository pass
thresholds.
