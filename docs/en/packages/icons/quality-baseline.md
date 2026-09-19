# Icons Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@aster/icons` public import evaluation
and emitted distribution changes. It is not a bundle-size promise, hardware-independent speed
guarantee or CI performance threshold. Current correctness evidence remains in
[Icons Quality](quality.md).

## Representative evidence

Each import scenario runs in seven fresh direct Node processes. A disposable synchronous module
hook instruments only emitted JavaScript beneath `packages/icons/dist`; its marker executes when
each package module evaluates. The probe reports the stable relative module set, public exports,
import time and complete process time without modifying package source or emitted artefacts.

| Workload | Pressure represented |
| --- | --- |
| Isolated icon import | One definition plus its directly shared authorship and visual-profile authorities. |
| Isolated collection import | One complete collection plus every member it explicitly retains. |
| Manifest import | Metadata-only discovery without complete icon or collection definitions. |
| Dynamic import | Exact asynchronous loader maps without eager definition evaluation. |
| Emitted distribution | JavaScript, declarations, bytes, export keys, side effects and dependencies. |

Core modules and Node internals are excluded from module counts because this baseline attributes
only Icons-owned evaluation. Fresh-process time includes Node startup and is therefore reported
separately from the instrumented dynamic import interval.

## Representative findings

Three pre-migration reports under Node `24.10.0` on Windows x64 produced these historical medians
across report medians:

| Scenario | Evaluated Icons modules | Median import time | Median process time |
| --- | ---: | ---: | ---: |
| Retired aggregate-root baseline | 31 | 58.44 ms | 110.13 ms |
| `icons.import.isolated-icon` | 3 | 26.79 ms | 77.80 ms |
| `icons.import.isolated-collection` | 29 | 57.74 ms | 108.70 ms |

The former package root evaluated every current icon, both
authoring authorities, its generated barrel and aggregate constant even though no collection was
requested. That historical baseline justified removing the aggregate root; it is no longer an
executable public scenario.

After facade generation and eager-surface retirement, current deterministic module evidence is:

| Scenario | Evaluated Icons modules |
| --- | ---: |
| `icons.import.isolated-icon` | 4 |
| `icons.import.isolated-collection` | 30 |
| `icons.import.manifest` | 2 |
| `icons.import.dynamic` | 2 |

The isolated Camera import evaluates its facade, definition and two shared authoring authorities.
The Amellus import necessarily evaluates its facade, collection, the same two authorities and all
twenty-six explicitly retained members. Neither import evaluates an unrelated definition.

After introducing the accepted metadata-only integration, a fresh manifest probe evaluates exactly
`manifest/index.js` and `generated/manifest/index.js`. It evaluates no canonical icon, collection or
authoring-authority module. Timing remains non-contractual; this exact two-module boundary is the
relevant correctness evidence.

The accepted dynamic integration likewise evaluates exactly `dynamic/index.js` and
`generated/dynamic/index.js` when imported. No definition or authoring authority executes until a
specific loader is invoked. Runtime and ABI evidence separately prove that each generated loader
targets one public definition facade and resolves the exact canonical object.

No timing optimisation follows from these observations alone. Module-set isolation is the primary
correctness evidence; elapsed time remains informative supporting evidence affected by host state.

## Distribution evidence

The current native ES2022 ESM output contains 136 files and 79,559 unminified bytes:

- 68 JavaScript modules totalling 64,997 bytes;
- 68 declaration files totalling 14,562 bytes;
- isolated-icon, isolated-collection, manifest and dynamic export patterns;
- explicit blocked aggregate-root and bare collection-family entries;
- `sideEffects: false`;
- public `@aster/core` as the only runtime dependency.

The corresponding package tarball contains those 136 emitted files plus `package.json`, `README.md`
and `LICENSE`. Clean-consumer evidence installs that actual tarball and rejects any additional
source, test or repository-tooling surface.

The pre-migration control contained 68 files and 55,087 bytes. The accepted facade, manifest and
loader responsibilities increase emitted file count while removing default package-wide runtime
evaluation. Neither figure is a size budget.

## Reproduction

Run:

```sh
pnpm benchmark:icons
```

The command builds Core and Icons, starts fresh probe processes for isolated icon, isolated
collection, manifest and dynamic imports, prints schema-version-one JSON
and writes no artefact. Reports include environment identity, complete evaluated-module lists,
public exports, import and process samples, emitted files and bytes, export keys, side effects and
dependencies.

Processor state, background load, storage, antivirus software, runtime revision and operating
system can affect timings. Reports are comparable only under equivalent conditions. Module sets
and distribution shape remain deterministic evidence.

## Acceptance rules

Correctness takes precedence over speed. A timing claim requires three equivalent control and
candidate reports, at least 10% improvement in its target scenario, and no unrelated regression
above 5% without an accepted trade-off. Distribution growth requires one concrete responsibility.

An isolated icon must never evaluate an unrelated definition. A metadata-only integration import
must evaluate no complete icon or collection definition. An exact collection import may evaluate
only its collection, its declared members and unavoidable shared authorities. Package ABI,
declarations, generated-output ownership, packed installation and complete verification remain
authoritative.

## Tooling boundary

Icons owns its baseline configuration, factory, runner and command. The fresh-process adapter,
module-import probe, import runner, statistics and distribution inspector are shared private
tooling because their contracts apply to more than one package baseline. None is shipped by Icons
or imported by production packages.
