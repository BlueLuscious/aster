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
| Root import | Current package-wide icon barrel and immutable `AsterIcons` aggregate. |
| Isolated icon import | One definition plus its directly shared authorship and visual-profile authorities. |
| Isolated collection import | One complete collection plus every member it explicitly retains. |
| Emitted distribution | JavaScript, declarations, bytes, export keys, side effects and dependencies. |

Core modules and Node internals are excluded from module counts because this baseline attributes
only Icons-owned evaluation. Fresh-process time includes Node startup and is therefore reported
separately from the instrumented dynamic import interval.

## Representative findings

Three complete reports under Node `24.10.0` on Windows x64 produced these medians across report
medians:

| Scenario | Evaluated Icons modules | Median import time | Median process time |
| --- | ---: | ---: | ---: |
| `icons.import.root` | 31 | 58.44 ms | 110.13 ms |
| `icons.import.isolated-icon` | 3 | 26.79 ms | 77.80 ms |
| `icons.import.isolated-collection` | 29 | 57.74 ms | 108.70 ms |

The isolated Camera import evaluates only its definition and the two shared authoring authorities.
The Amellus import necessarily evaluates its collection, the same two authorities and all
twenty-six explicitly retained members. The package root evaluates every current icon, both
authoring authorities, its generated barrel and aggregate constant even though no collection was
requested. This establishes the eager root cost that later distribution changes must remove.

No timing optimisation follows from these observations alone. Module-set isolation is the primary
correctness evidence; elapsed time remains informative supporting evidence affected by host state.

## Distribution evidence

The measured native ES2022 ESM output contains 68 files and 55,087 unminified bytes:

- 34 JavaScript modules totalling 46,468 bytes;
- 34 declaration files totalling 8,619 bytes;
- root, isolated-icon, collection-family and isolated-collection export patterns;
- `sideEffects: false`;
- public `@aster/core` as the only runtime dependency.

These figures describe the pre-migration package and form a comparison point, not a size budget.
Generated facade, manifest and loader responsibilities may increase emitted file count while still
reducing unrelated runtime evaluation.

## Reproduction

Run:

```sh
pnpm benchmark:icons
```

The command builds Core and Icons, starts fresh probe processes, prints schema-version-one JSON
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
