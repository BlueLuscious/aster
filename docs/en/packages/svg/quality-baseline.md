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
