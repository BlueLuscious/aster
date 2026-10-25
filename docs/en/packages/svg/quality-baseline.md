# SVG Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@luscious-garden/aster-svg` rendering and distribution
changes. It is not a product benchmark, a hardware-independent promise, or a CI performance
threshold. [SVG Quality](quality.md) owns correctness and consumer conformance. Shared sampling
and report aggregation are specified by [Performance Tooling](../../tooling/performance/index.md#structure).

## Representative evidence

The schema-version-two baseline uses only public `@luscious-garden/aster-core` and `@luscious-garden/aster-svg` roots. A fixed
sixteen-definition synthetic corpus, specialised definitions and options are prepared and frozen
before timing begins, while every complete markup result enters a deterministic checksum.

| Workload | Pressure represented |
| --- | --- |
| Core revalidation reference | Public Core acceptance invoked at the start of every SVG render. |
| Minimal icon | Fixed option, presentation, node, escaping, and complete-document cost. |
| Every primitive | Node dispatch, complete presentation, geometry attributes, and document composition. |
| Fixed corpus | Round-robin rendering across sixteen canonical synthetic definitions. |
| Semantic accessibility | Label, title, accessible-name, escaping, and semantic root attributes. |
| Authorised overrides | Complete option normalisation and presentation override precedence. |
| RTL mirroring | Direction policy, translation, title ordering, and generated group composition. |
| Escaping pressure | XML validation and replacement-heavy attribute and text values. |
| Dense point sequence | Definition acceptance, coordinate conversion, flattening and large markup composition. |

The Core reference is attribution evidence rather than an SVG product operation. It grants no
SVG-owned bypass: [Core](../core/definition/runtime/index.md#recognised-outputs) decides whether
to recognise an output or fully reconstruct unknown data. Recognised and unknown inputs must be
measured separately.

## Current Rendering Reference

A Windows x64 reference uses Node `24.10.0`, V8 `13.6`, TypeScript `5.9.3` and pnpm `10.28.1`.
Each value is the median of three worker medians with seven samples, baseline-calibrated fixed
counts and equal complete-output fingerprints. Definitions/options are prepared outside timing;
the complete SVG enters checksum consumption. Filesystem caches, scheduling, thermals and
antivirus are uncontrolled. The
[supplemental protocol](../../tooling/performance/index.md#supplemental-measurements)
owns sampling; these are local costs, not CI thresholds or universal latency guarantees.

| Complete operation | Median |
| --- | ---: |
| Authorised overrides | 6.366 us/render |
| Polyline, 8 points | 7.084 us/render |
| Polyline, 128 points | 44.990 us/render |
| Polyline, 1,024 points | 309.624 us/render |
| Polygon, 128 points | 41.521 us/render |
| Foreign-Core polyline, 128 points | 141.880 us/render |
| 10,000 simple canonical definitions | 51.055 ms/batch |

The supplemental matrix varies 0/1/10/100/1,000/10,000-definition batches, 16/64/256 nodes,
8/128/1,024 points or cubic segments, text width and option shape independently. An empty batch
contains no render calls, not an accepted empty definition. Canonical, copied, JSON and
foreign-Core inputs retain their different admission work. The standard command below runs the
fixed nine scenarios, not this entire matrix.

Every measured render includes the acceptance and complete serialisation described by
[Render Runtime](render/runtime/index.md). [Core's reuse guide](../core/definition/runtime/index.md#reusing-definitions)
explains how definition preparation affects that work. CLI planning, HTML, process startup and
filesystem publication are separate operations; see the
[integrated reference](../../tooling/performance/index.md#integrated-consumer-observations).

## Resource Reference

Three separate process observations render one 128-point definition 10,000 times without
retaining each SVG. Sampled RSS spans 69.4-76.4 MiB, post-GC used heap is approximately 6.29 MiB
and 83-89 GC events are observed. These describe the whole process, not a renderer memory budget.

A separate lifecycle retains 2,000 SVG strings: used heap reaches approximately 9.1 MiB and returns
to 5.7 MiB after release, while the prepared definition remains reachable. The
[shared resource methodology](../../tooling/performance/index.md#processes-and-resources)
owns interpretation limits; these whole-process observations do not attribute every resident page
to SVG strings. Resource instrumentation is separate from native latency.

## Reproduction

Run the development-only comparison from a clean workspace:

```sh
pnpm benchmark:svg
```

The command builds Core and SVG, runs Node with explicit garbage-collection access, prints
schema-version-two JSON, and writes no artefact. It reports the scenario matrix above and the
distribution built from the current checkout. [Performance Tooling](../../tooling/performance/index.md)
owns shared report fields, sampling, heap-pressure interpretation and environmental comparison
limits.

## Acceptance rules

[Shared comparison rules](../../tooling/performance/index.md#comparison-limits) govern sampling,
claim thresholds and accepted trade-offs. Runtime, type, ABI, architecture, documentation and
workflow conformance remain authoritative.

Core's production recognition policy is part of the measured public operation, not a fixture-owned
bypass. The [shared methodology](../../tooling/performance/index.md#processes-and-resources) owns
resource/profile separation and disposable evidence.

## Tooling boundary

The [performance composition](../../tooling/performance/index.md#package-runtime-composition)
owns private factories, runners and shared host capabilities. SVG's baseline selects only SVG
fixtures and scenarios. None of that tooling ships in the package or enters production imports.
