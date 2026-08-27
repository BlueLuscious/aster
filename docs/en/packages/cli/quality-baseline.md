# CLI Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@aster/cli` execution, startup, and
distribution changes. It is not a product benchmark, a hardware-independent promise, or a CI
performance threshold. Current package findings remain in [CLI Quality](quality.md).

## Representative evidence

Prepared immutable inputs keep fixture construction outside timed operations. Programmatic
scenarios use the public package roots; shell parsing and presentation scenarios exercise the
private built host directly without process or package-manager cost.

| Workload | Pressure represented |
| --- | --- |
| Core revalidation reference | Portable definition reconstruction necessarily performed while accepting catalogue snapshots. |
| SVG rendering reference | Public rendering necessarily performed while constructing SVG export artefacts. |
| Help and version | Invocation acceptance, context acceptance, dispatch, result construction, and freezing without catalogue acquisition. |
| Built-in provider load | Lazy Icons module acquisition and immutable snapshot adaptation without catalogue queries. |
| Icon discovery | Complete provider loading, definition reconstruction, membership validation, canonical ordering, and result freezing. |
| Icon export | Exact catalogue selection, one SVG render, artefact planning, and result freezing. |
| Collection export | Complete membership resolution, sixteen SVG renders, canonical path ordering, artefact planning, and result freezing. |
| Shell parsing | Minimal help and complete collection-export argv adaptation without process acquisition. |
| JSON presentation | Complete structured-result serialisation and stream planning without process writes. |
| Cold Node control | Fresh Node startup without Aster module evaluation. |
| Cold root import | Fresh Node startup plus programmatic root composition and module evaluation. |
| Cold executable version | Fresh Node startup, private host acquisition, argv parsing, command execution, presentation, and process writes. |

Filesystem publication and package-manager startup are excluded from timing because they measure
host and storage conditions rather than command-domain execution. Their behaviour remains covered
by deterministic conformance tests.

## Initial evidence

Three complete reports under Node `24.10.0` on Windows x64 produced these medians across report
medians:

| Scenario | Median elapsed time |
| --- | ---: |
| `cli.reference.core-revalidation` | 10,932 ns per operation |
| `cli.reference.svg-render` | 21,071 ns per operation |
| `cli.shell.parse-help` | 258 ns per operation |
| `cli.shell.parse-collection-export` | 1,158 ns per operation |
| `cli.shell.present-json` | 17,961 ns per operation |
| `cli.command.help` | 4,388 ns per operation |
| `cli.command.version` | 3,855 ns per operation |
| `cli.catalogue.provider-load` | 6,932 ns per operation |
| `cli.command.list-icons` | 492,594 ns per operation |
| `cli.command.export-icon` | 558,947 ns per operation |
| `cli.command.export-collection` | 914,240 ns per operation |
| `cli.cold.node-control` | 41.39 ms per process |
| `cli.cold.root-import` | 115.77 ms per process |
| `cli.cold.executable-version` | 141.14 ms per process |

The parser, presenter dispatch, invocation acceptance, context acceptance, result construction, and
built-in provider adaptation do not expose an isolated material CLI-owned hotspot. Catalogue
commands are dominated by strict portable-definition reconstruction and complete result isolation;
export adds public SVG rendering proportional to selected artefacts. Cold startup is dominated by
fresh Node startup and ESM graph acquisition rather than command execution.

No runtime optimisation is retained from this investigation. Caching accepted snapshots,
retaining mutable memoisation, trusting canonical object provenance, bundling private modules, or
weakening reconstruction would change correctness or distribution boundaries without evidence of
a safe CLI-owned mechanism.

## Distribution evidence

The measured native ES2022 ESM output contains 222 files and 256,485 unminified bytes:

- 130 JavaScript modules totalling 183,742 bytes;
- 92 declaration files totalling 72,743 bytes;
- one public root export;
- one private `aster` binary mapping;
- `sideEffects: false`;
- exact Core, Icons, and SVG runtime dependencies;
- the declared Node `>=24.10.0 <25` executable range.

`pnpm pack --dry-run` admits 225 deliberate package files: the emitted distribution, manifest,
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
access. It prints schema-version-one JSON and writes no artefact. Reports include environment,
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

CLI owns its fixture factory, operation runner, cold-start runner, Node process adapter, composition
factory, and command. Generic synchronous and asynchronous measurement, statistics, heap, clock,
repository, and distribution capabilities remain shared private tooling. Neither layer is shipped
by CLI or imported by production packages.
