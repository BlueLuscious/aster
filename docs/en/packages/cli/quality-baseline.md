# CLI Quality Baseline

Status: **Accepted**

This page owns the evidence method and a dated source snapshot for CLI execution, startup and
distribution. It is not a hardware-independent promise or CI timing threshold.
[CLI Quality](quality.md) owns correctness evidence.

## Reproduction

```sh
pnpm run benchmark:cli
```

The command builds Core, Icons, SVG and CLI, then runs the schema-five report with explicit
garbage-collection access. It prints JSON without writing product artefacts.
[Performance Tooling](../../tooling/performance/index.md) owns shared sampling and composition.

## Representative evidence

The runner prepares a fixed synthetic catalogue outside timed operations. Programmatic scenarios
use public package roots; shell parsing and JSON presentation run without process acquisition.
Separate fresh processes measure native startup and real built-in command evaluation.

| Workload | Responsibility measured |
| --- | --- |
| Core and SVG references | Reused canonical definition recognition and SVG rendering controls. |
| Help and version | Invocation/context acceptance, dispatch and immutable result construction. |
| Prepared provider discovery | Provider invocation without catalogue normalisation. |
| Icon listing | Discovery validation, membership consistency, ordering and projection. |
| Icon/collection export | Exact selection, SVG rendering and artefact planning; the collection fixture contains sixteen definitions. |
| Collection review | Exact selection, sixteen SVG renders and technical evidence planning. |
| Shell parsing and JSON presentation | Argv adaptation and serialisation without process or filesystem effects. |
| Cold controls and command evaluation | Node startup, root/executable acquisition and exact CLI/Icons module sets. |

Filesystem publication and package-manager startup are excluded from command-domain timing.
Owned publication observations are separate from deterministic conformance tests and do not
constitute storage-speed guarantees.

## Scaled command evidence

Supplemental observations on 20 October 2026 use Windows x64, Node `24.10.0`, V8
`13.6.233.10-node.28` and native ES2022 ESM. Each value is the median of three worker medians,
each retaining seven samples with baseline-calibrated operation counts and bounded warm-up.
Workers use `--expose-gc` and a 2 GiB old-space ceiling. Fixture construction, pre-sample GC and
complete result hashing are outside timing; awaited command execution and result consumption
are inside. Filesystem caches, scheduling, thermals and antivirus are not isolated.

These are measured current costs, not guaranteed API latency. `D` counts definitions, `C`
collections and `R` selected membership references. The collection-list rows use the same ten
definitions in every collection, with 1,000 total available definitions; shared references
must not be reported as distinct definitions.

| Complete operation | Workload | Median |
| --- | --- | ---: |
| List icons | D = 1,000; C = 1; R = 10 | 5.53 ms |
| List collections | D = 1,000; C = 10; R = 100 | 5.54 ms |
| List collections | D = 1,000; C = 100; R = 1,000 | 10.82 ms |
| List collections | D = 1,000; C = 1,000; R = 10,000 | 51.95 ms |
| Export collection plan | D = 1,000; C = 1; R = 1,000 | 32.29 ms |
| Review collection plan | D = 1,000; C = 1; R = 1,000 | 32.28 ms |

Plans retain SVG markup; their times exclude presentation and filesystem publication. Separate
prepared-result measurements observe JSON/human formatting and static HTML serialisation, not
another discovery or command execution. Output width, geometry and the selected member count
remain independent costs. Fresh executable acquisition is separate from repeated API execution;
these figures do not describe starting `pnpm exec` or a Node process.

Every catalogue command validates fresh discovery before filtering. A provider or collection
filter is not permission to skip validation of other supplied providers. The
[membership runtime](catalogue/runtime/index.md) owns the inspection-local index and error order;
there is no persistent discovery cache. Repeated commands therefore pay for fresh metadata
admission even when providers return the same objects.

Three separate resource observations of ten complete collection-list commands at D = 1,000,
C = 1,000 and R = 10,000 record sampled peak RSS of 135.8-136.3 MiB and post-GC heap of
12.16-12.18 MiB, with the prepared fixture still live. Sampling can miss transient peaks;
heap deltas and GC events do not count allocations or prove leak freedom. These are process
observations, not the size of the temporary membership index or portable memory budgets.

Separate local observations retain seven complete planning-and-publication samples in each of
three passes. Publishing 1,000 one-primitive SVG files takes a median of approximately 665 ms;
planning and publishing the corresponding single-file static Review takes approximately 71 ms.
These include staging and the commit rename beneath fresh owned temporary targets, but exclude
post-timing content verification and cleanup. Existing-target refusal, owned Review replacement
and absence of abandoned stages are checked separately. File volume and the local filesystem
matter; these figures are not pure command-domain or storage-only costs.

## Lazy-integration evidence

A 20 October 2026 Windows x64 observation using Node `24.10.0`, TypeScript `5.9.3` and native
ES2022 ESM retains these sets across five fresh processes per workflow:

| Workflow | Stable result | CLI modules | Icons modules |
| --- | --- | ---: | ---: |
| `list icons` | `success:icon-list` | 74 | 2 |
| `search camera` | `success:search` | 74 | 2 |
| `show icon aster/camera@outline` | `success:icon-show` | 74 | 2 |
| `export icon aster/camera@outline` | `success:export` | 74 | 8 |
| `review icon aster/camera@outline` | `success:review` | 74 | 8 |

Discovery evaluates only the Icons manifest pair, without artwork, facades or dynamic loaders.
Exact Export/Review additionally evaluate the dynamic entry/map, one canonical definition
and its shared authoring authorities, without a public facade. Root import itself evaluates no
Icons modules. Module counts describe this snapshot, not permanent budgets or bundler tree-shaking
guarantees.

## Distribution snapshot

The same source emits 196 JavaScript modules (338,763 bytes) and 140 declarations (132,796 bytes):
336 files, totalling 471,559 unminified bytes. It retains ESM, one public root, the private `aster`
binary, `sideEffects: false`, Core/Icons/SVG runtime dependencies and Node `>=24.10.0 <25`.
Shell type-only JavaScript emission is a compiler detail, not justification for a new build format.
[Packed conformance](quality.md#conformance) verifies the acquired payload and declarations.

## Comparison rules

[Shared comparison limits](../../tooling/performance/index.md#comparison-limits) govern sampling
and environmental interpretation. A CLI optimisation claim requires three equivalent baseline/
candidate reports, at least 10% improvement in its target and no unrelated regression above 5%
without an accepted trade-off. Security corrections may have an explicit cost; they are not
optimisations merely because the structure is clearer.

A comparison preserves workload and contract semantics, except for explicitly approved structured
field changes. It checks diagnostics, ordering, SVG/HTML bytes, human streams/status, paths, native
module sets and package ABI separately. Retain paired variation and outliers rather than claiming
equivalence from aggregate medians. Heap growth is a pressure indicator, not an allocation count.
Raw reports are disposable local evidence; this page does not preserve retired command forms,
obsolete distribution snapshots or incomparable historical timing tables.
