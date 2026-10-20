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
to recognise an output or fully reconstruct unknown data. The canonical-output comparison below
measures that distinction; earlier comparisons retain their original implementation scope.

## Scaled Rendering and Private Intermediates

A supplemental comparison uses source baseline `828f2fd`, Node `24.10.0`, TypeScript `5.9.3`
and pnpm `10.28.1` on Windows x64. Three matched rounds rotate baseline, byte-identical control
and candidate, and rotate workload order. Each fresh process retains seven raw samples with
baseline-calibrated operation counts and equal complete-output fingerprints and checksums.
The [shared protocol](../../tooling/performance/index.md#supplemental-measurements) owns sampling
and resource limits. These are source comparisons, not comparisons of named npm releases.

The finite matrix separates batches of 0/1/10/100/1,000/10,000 definitions, 16/64/256 nodes,
8/128/1,024 points or cubic segments, and absent/empty/null-prototype/semantic/override/RTL/
escaping options. Wide text varies output pressure separately. Canonical, shallow-copied,
JSON and independently constructed foreign-Core inputs retain their different admission costs;
dense and large-batch foreign cases are measured explicitly. An empty batch contains no calls,
not an accepted empty definition. Its capped loop timings support no performance claim.

Two one-variable comparisons precede their combined implementation:

- A fresh option snapshot has its prototype removed before capture, then retains the same
  own-key/descriptor checks, value validation and final freezing. The observed V8 representation
  changes from dictionary to fast properties, with equal closed descriptors and null prototype.
  Isolated override normalisation falls from 2.351 to 1.741 us. This engine observation is not a
  portable API guarantee; no-options renders execute zero snapshot captures.
- Point serialisation maps each coordinate pair directly to its ASCII-separated text, instead
  of creating a two-element array per point and flattening it. Coordinate conversion order/count,
  target validation and output remain equal. There are still intermediate strings and one mapped
  array; this is not allocation-free rendering. Isolated 128-point serialisation falls from
  55.667 to 41.709 us.

Private-stage probes, call counters, CPU/GC/JIT profiles and sampled allocation stacks are
separate attribution evidence, not substitutes for public `Svg.render()` measurements. Stage
medians are not added as an exact decomposition. No historical slowdown is assigned a GC/JIT
cause without matching evidence.

The combined 29-workload comparison gives the following medians of three process medians:

| Complete operation | Baseline | Identical control | Retained |
| --- | ---: | ---: | ---: |
| Authorised overrides, us/render | 7.133 | 7.053 | 6.366 |
| Polyline, 8 points, us/render | 8.327 | 8.197 | 7.084 |
| Polyline, 128 points, us/render | 57.871 | 57.850 | 44.990 |
| Polyline, 1,024 points, us/render | 453.886 | 433.645 | 309.624 |
| Polygon, 128 points, us/render | 56.397 | 55.968 | 41.521 |
| Foreign-Core polyline, 128 points, us/render | 154.201 | 152.105 | 141.880 |
| 10,000 simple canonical definitions, ms/batch | 50.948 | 51.110 | 51.055 |

Overrides and the 8/128/1,024-point polylines improve by approximately 10.8% and 14.9%/22.3%/31.8%.
No unrelated final median increase exceeds 5%; individual rounds still vary. Earlier isolated
increases for empty options and 64-circle geometry do not persist in the combined comparison.
Wide-text rendering changes by +4.3%, against +3.4% for unchanged control; small/mixed differences
do not establish a universal gain. The 10,000-definition batch is effectively unchanged (+0.2%).
Unknown values still undergo full Core acceptance, and their smaller relative gains must not be
labelled recognition gains.

Six programmatic consumer comparisons retain equal complete outputs. Export planning for sixteen
128-point definitions falls from 982 to 739 us (-24.8%); Review planning plus HTML serialisation
falls from 2.585 to 2.380 ms (-7.9%). Simple 16/100-definition export and sixteen-definition Review
change by +0.7-0.8%, against +1.6-3.7% for unchanged controls. Import adoption followed by rendering
changes by -3.1% with mixed paired directions, not a conclusive gain. These include full-result
checksums, but not fresh CLI process startup, filesystem publication or browser/bundler execution.

A separate three-round 128-point resource check observes median sampled RSS of 76.3 -> 79.0 MB,
with overlapping ranges of 73.6-79.2 and 74.2-80.2 MB. Paired increases are 0.6-2.7 MB; their exact
resident-memory mechanism is not isolated. Post-GC heap remains approximately 6.59 MB in both,
while median observed GC events fall from 121 to 89 per 10,000 renders. Sampled allocation stacks
also lose the point-flattening arrays, but a general memory reduction does not follow. Heap/GC
observations and allocation samples are not exact allocation counts, peak-memory guarantees or
evidence of leak freedom.

The compiled SVG boundary remains 22 JavaScript modules and 22 declarations, growing by 84 bytes
in total (43,059 -> 43,143 bytes). Declaration signatures, exports and dependency metadata remain
unchanged; the growth belongs to private snapshot construction and its ownership documentation.

The standard command below keeps its nine schema-version-two meanings; the extended matrix is
supplemental. No cache, public API, dependency, acceptance rule or markup contract changes.

## Canonical-output acceptance comparison

The five matched source-revision pairs used the
[Core comparison conditions](../core/quality-baseline.md#canonical-output-recognition-comparison)
and unchanged schema-version-two SVG workloads. Definitions/options were prepared outside timing;
every complete markup result entered the checksum. Values are medians of five report medians,
with their minimum/maximum, in ns per public operation. These measure source, not named npm releases.

| Workload | Control median (range) | Recognition median (range) |
| --- | ---: | ---: |
| Core acceptance reference | 6,941 (6,786-7,071) | 24 (21-27) |
| Minimal icon | 12,829 (12,217-12,989) | 6,413 (6,294-6,488) |
| Every primitive | 60,780 (58,127-70,169) | 32,965 (31,919-35,322) |
| Fixed corpus | 19,345 (18,426-22,698) | 10,006 (9,769-11,829) |
| Semantic accessibility | 15,281 (14,718-17,120) | 9,907 (9,133-11,252) |
| Authorised overrides | 15,869 (15,574-17,381) | 5,891 (5,687-6,159) |
| RTL mirroring | 14,541 (14,184-14,996) | 5,898 (5,718-6,303) |
| Escaping pressure | 16,478 (15,210-16,680) | 7,131 (6,947-7,427) |
| Dense point sequence | 147,000 (142,190-158,338) | 50,642 (46,702-52,742) |

Minimal and dense complete rendering improved by 50.01% and 65.55%, with the same direction in
every pair. Both exceed 10% and twice their respective control spreads of 6.02% and 10.99%.
The attribution-only Core reference is not an SVG result. Options, XML validation, geometry
serialisation and complete document construction still execute on every render. SVG production
code did not change; Core's recognition decision removes repeated reconstruction of its own output.

Unknown input is not covered by those own-output gains. Supplemental matched loops over equal
foreign/JSON geometry still performed full Core acceptance. Small foreign rendering rose from
13,148 to 13,586 ns, within 7.89% control variation; dense foreign rendering changed from 149,940
to 140,287 ns, within 15.98% variation. No foreign-input speed-up is established. Core owns its
[construction trade-offs](../core/quality-baseline.md#unknown-input-costs); optional preparation
belongs to its [runtime guide](../core/definition/runtime/index.md#preparing-external-definitions),
not an SVG cache or a second renderer API.

The emitted SVG distribution stayed at 22 JavaScript modules/32,892 bytes and 22 declarations/
9,388 bytes, with unchanged exports, dependencies and side-effect metadata. Sampled heap growth
fell from 844 to 219 bytes/op for minimal rendering but rose from 6,603 to 7,663 for the dense case.
These mixed deltas establish neither exact allocations nor a general memory-reduction claim.

Fresh-process controls under the linked comparison conditions gave first own-input rendering
medians of 0.882 -> 0.828 ms and prepared-JSON rendering of 1.792 -> 1.822 ms. Complete JSON-process
time rose 7.49%, within a 19.15% control spread and with mixed batch directions. Startup differences
are not established as material changes; these are not filesystem cold-cache measurements.

Use the [SVG command](#reproduction) for the main matrix on both source revisions. Supplemental
foreign/JSON and first-use controls are separate comparisons, not additional standard report
scenarios or CI timing assertions. Earlier escaping findings below remain historical evidence.

## Initial evidence and attribution

The following schema-version-one findings used the former product corpus and remain historical
investigation evidence; they are not directly comparable with schema-version-two reports. Three
complete reports under Node `24.10.0` on Windows x64 produced these medians across report medians:

| Scenario | Initial median |
| --- | ---: |
| `svg.reference.core-revalidation` | 7,055 ns |
| `svg.render.minimal` | 21,728 ns |
| `svg.render.primitives` | 98,342 ns |
| `svg.render.corpus` | 38,653 ns |
| `svg.render.semantic` | 23,722 ns |
| `svg.render.overrides` | 24,064 ns |
| `svg.render.rtl-mirror` | 21,675 ns |
| `svg.render.escaping` | 24,611 ns |
| `svg.render.point-sequence` | 136,798 ns |

Three CPU profiles attributed 33.71% of repository self-time to repeated attribute escaping.
`SvgMarkupSerialiser.#attributeText` traversed every value through six sequential `replaceAll()`
operations even when no character required replacement. Core exact-field inspection was the next
largest family; option normalisation, presentation resolution, node dispatch, point flattening,
XML validation, freezing, and individual composition methods did not expose another isolated SVG
hotspot of comparable magnitude.

## Retained experiment

The sole candidate replaced sequential attribute replacements with one character traversal. It
returns the original string without allocation when no escaping is required and appends only the
segments surrounding an accepted escapable character otherwise. Character validation, entities,
ordering, errors, and complete output bytes remain unchanged.

Three equivalent control and candidate reports produced:

| Scenario | Control | Candidate | Difference |
| --- | ---: | ---: | ---: |
| Core revalidation reference | 7,055 ns | 6,830 ns | 3.2% faster |
| Minimal icon | 21,728 ns | 12,629 ns | 41.9% faster |
| Every primitive | 98,342 ns | 55,209 ns | 43.9% faster |
| Former product corpus | 38,653 ns | 22,486 ns | 41.8% faster |
| Semantic accessibility | 23,722 ns | 15,121 ns | 36.3% faster |
| Authorised overrides | 24,064 ns | 15,161 ns | 37.0% faster |
| RTL mirroring | 21,675 ns | 13,460 ns | 37.9% faster |
| Escaping pressure | 24,611 ns | 15,778 ns | 35.9% faster |
| Dense point sequence | 136,798 ns | 129,800 ns | 5.1% faster |

The target scenarios exceed the 10% acceptance threshold with no measured regression. Candidate
profiles no longer expose attribute escaping as a material hotspot; strict Core revalidation
becomes the dominant repository-owned family and remains intentionally unchanged.

The retained implementation increases unminified emitted JavaScript by 966 bytes, from 26,349 to
27,315 bytes. This 3.7% increase represents the explicit single-pass algorithm. Declaration bytes,
module counts, exports, dependencies, and side-effect metadata remain unchanged.

## Retained pressure snapshot

A separate three-report reading of the retained implementation produced the following informative
medians across report medians:

| Scenario | Elapsed time | Non-negative heap growth |
| --- | ---: | ---: |
| Core revalidation reference | 6,923 ns | 679 bytes |
| Minimal icon | 12,727 ns | 690 bytes |
| Every primitive | 56,738 ns | 456 bytes |
| Former product corpus | 23,305 ns | 1,540 bytes |
| Semantic accessibility | 15,928 ns | 1,387 bytes |
| Authorised overrides | 15,331 ns | 2,720 bytes |
| RTL mirroring | 14,270 ns | 1,370 bytes |
| Escaping pressure | 16,523 ns | 1,665 bytes |
| Dense point sequence | 133,789 ns | 5,435 bytes |

Heap growth is a pressure indicator, not an allocation counter. No memory claim or compatibility
promise is inferred from these machine-specific values.

## Distribution observation

A separate recorded compiler inspection contained 22 JavaScript modules totalling 32,566 bytes
and 22 declaration files totalling 9,388 bytes. This historical unminified observation is not a
fixed package boundary or a claim about the current checkout. The command below reports current
distribution counts and bytes; production format and dependencies belong to the
[package boundary](index.md#boundary), not to benchmark measurements.

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

Correctness takes precedence over performance. A claim requires three equivalent control and
candidate reports, at least 10% improvement in its target scenario, and no unrelated regression
above 5% without an accepted trade-off. Distribution growth requires one concrete responsibility.
Runtime, type, ABI, architecture, documentation, and workflow conformance remain authoritative.

The measured package implementation must run unchanged: no benchmark-only caches, registries,
pretrusted inputs, mutable memoisation, output streaming, weakened validation or private package
imports. Core's production recognition policy is part of the measured public operation, not a
fixture-owned bypass. Raw reports and CPU profiles are disposable evidence and are not committed.

## Tooling boundary

The [performance composition](../../tooling/performance/index.md#package-runtime-composition)
owns private factories, runners and shared host capabilities. SVG's baseline selects only SVG
fixtures and scenarios. None of that tooling ships in the package or enters production imports.
