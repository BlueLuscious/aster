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
Their behaviour belongs to deterministic conformance tests, not storage-speed claims.

## Lazy-integration evidence

A 19 October 2026 Windows x64 observation using Node `24.10.0`, TypeScript `5.9.3` and native
ES2022 ESM retains these sets across five fresh processes per workflow:

| Workflow | Stable result | CLI modules | Icons modules |
| --- | --- | ---: | ---: |
| `list icons` | `success:icon-list` | 74 | 2 |
| `search camera` | `success:search` | 74 | 2 |
| `show icon aster/camera@outline` | `success:icon-show` | 74 | 2 |
| `export icon aster/camera@outline` | `success:export` | 74 | 9 |
| `review icon aster/camera@outline` | `success:review` | 74 | 9 |

Discovery evaluates only the Icons manifest pair, without artwork, facades or dynamic loaders.
Exact Export/Review additionally evaluate the dynamic entry/map, one concrete facade/definition
and its shared authoring authorities. Root import itself evaluates no Icons modules. Module
counts describe this snapshot, not permanent budgets or bundler tree-shaking guarantees.

## Distribution snapshot

The same source emits 196 JavaScript modules (338,131 bytes) and 140 declarations (132,511 bytes):
336 files, totalling 470,642 unminified bytes. It retains ESM, one public root, the private `aster`
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
