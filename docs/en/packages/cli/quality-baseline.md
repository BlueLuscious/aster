# CLI Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@aster/cli` execution, startup, and
distribution changes. It is not a product benchmark, a hardware-independent promise, or a CI
performance threshold. Current package findings remain in [CLI Quality](quality.md).

## Representative evidence

The schema-version-two baseline prepares a fixed synthetic catalogue outside timed operations.
Programmatic scenarios use the public package roots; shell parsing and presentation scenarios
exercise the private built host directly without process or package-manager cost.

| Workload | Pressure represented |
| --- | --- |
| Core revalidation reference | Portable definition reconstruction necessarily performed while accepting catalogue snapshots. |
| SVG rendering reference | Public rendering necessarily performed while constructing SVG export artefacts. |
| Help and version | Invocation acceptance, context acceptance, dispatch, result construction, and freezing without catalogue acquisition. |
| Prepared provider load | Asynchronous provider invocation and immutable snapshot return without catalogue queries. |
| Icon discovery | Complete provider loading, definition reconstruction, membership validation, canonical ordering, and result freezing. |
| Icon export | Exact catalogue selection, one SVG render, artefact planning, and result freezing. |
| Collection export | Complete membership resolution, sixteen SVG renders, canonical path ordering, artefact planning, and result freezing. |
| Collection review | Complete membership resolution, sixteen SVG renders, technical evidence planning, and result freezing. |
| Shell parsing | Minimal help and complete collection-export argv adaptation without process acquisition. |
| JSON presentation | Complete structured-result serialisation and stream planning without process writes. |
| Cold Node control | Fresh Node startup without Aster module evaluation. |
| Cold root import | Fresh Node startup plus programmatic root composition and module evaluation. |
| Cold executable version | Fresh Node startup, private host acquisition, argv parsing, command execution, presentation, and process writes. |

Filesystem publication and package-manager startup are excluded from timing because they measure
host and storage conditions rather than command-domain execution. Their behaviour remains covered
by deterministic conformance tests.

## Representative findings

Three complete reports under Node `24.10.0` on Windows x64 produced these medians across report
medians:

| Scenario | Median elapsed time |
| --- | ---: |
| `cli.reference.core-revalidation` | 13,706 ns per operation |
| `cli.reference.svg-render` | 22,639 ns per operation |
| `cli.shell.parse-help` | 290 ns per operation |
| `cli.shell.parse-collection-export` | 1,377 ns per operation |
| `cli.shell.present-json` | 20,813 ns per operation |
| `cli.command.help` | 4,357 ns per operation |
| `cli.command.version` | 3,953 ns per operation |
| `cli.catalogue.provider-load` | 20,370 ns per operation |
| `cli.command.list-icons` | 467,887 ns per operation |
| `cli.command.export-icon` | 569,496 ns per operation |
| `cli.command.export-collection` | 1,098,570 ns per operation |
| `cli.command.review-collection` | 911,430 ns per operation |
| `cli.cold.node-control` | 43.74 ms per process |
| `cli.cold.root-import` | 138.48 ms per process |
| `cli.cold.executable-version` | 163.21 ms per process |

These findings belong to schema version one, which used the former product catalogue, and are not
directly comparable with schema-version-two reports. The parser, presenter dispatch, invocation
acceptance, context acceptance, result construction, and
provider adaptation do not expose an isolated material CLI-owned hotspot. Catalogue
commands are dominated by strict portable-definition reconstruction and complete result isolation;
Export and Review add public SVG rendering proportional to selected definitions. Review planning
remains comparable to collection Export without adding a material isolated hotspot. Cold startup
is dominated by fresh Node startup and ESM graph acquisition rather than command execution.

No runtime optimisation is retained from this investigation. Caching accepted snapshots,
retaining mutable memoisation, trusting canonical object provenance, bundling private modules, or
weakening reconstruction would change correctness or distribution boundaries without evidence of
a safe CLI-owned mechanism.

## Distribution evidence

The measured native ES2022 ESM output contains 274 files and 345,415 unminified bytes:

- 160 JavaScript modules totalling 243,973 bytes;
- 114 declaration files totalling 101,442 bytes;
- one public root export;
- one private `aster` binary mapping;
- `sideEffects: false`;
- exact Core, Icons, and SVG runtime dependencies;
- the declared Node `>=24.10.0 <25` executable range.

`pnpm pack --dry-run` admits 277 deliberate package files: the emitted distribution, manifest,
README, and licence. Conformance packs Core, Icons, SVG, and CLI into local tarballs, installs them
with strict engine checking and no network dependency, executes the linked `aster` binary, imports
the root, and exercises equivalent standalone and programmatic workflows. Empty JavaScript modules
for shell type-only sources are an observed TypeScript emission detail; removing them does not
justify bundling or a second distribution format.

## Reproduction

Run:

```sh
pnpm benchmark:cli
```

The command builds Core, Icons, SVG, and CLI, then runs Node with explicit garbage-collection
access. It prints schema-version-two JSON and writes no artefact. Reports include environment,
synchronous and asynchronous operation samples, heap-pressure indicators, deterministic
checksums, fresh-process samples, emitted files and bytes, exports, side effects, engine range,
binary mapping, and dependencies.

Heap growth is a pressure indicator rather than an allocation counter. Processor state, background
load, storage, antivirus software, runtime revision, and operating system can affect measurements.
Reports are comparable only under equivalent conditions.

## Acceptance rules

Correctness takes precedence over performance. A claim requires three equivalent control and
candidate reports, at least 10% improvement in its target scenario, and no unrelated regression
above 5% without an accepted trade-off. Distribution growth requires one concrete responsibility.
Runtime, type, ABI, architecture, documentation, workflow, packed-installation, and executable
conformance remain authoritative.

Caches, ambient registries, mutable memoisation, hidden trust brands, weakened validation,
pretrusted definitions, altered output, private public-package imports, and machine-specific CI
thresholds are never benchmark shortcuts. Raw reports are disposable local evidence and are not
committed.

## Tooling boundary

CLI owns its fixture factory, operation runner, cold-start policy, composition factory and command.
The Node process adapter is shared private tooling because Icons import evaluation now requires the
same fresh-process capability. One generic runner measures synchronous or asynchronous scenario
results sequentially while statistics, heap, clock, repository and distribution capabilities
remain shared. Neither layer is shipped by CLI or imported by production packages.
