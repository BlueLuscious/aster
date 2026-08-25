# SVG Quality Baseline

Status: **Accepted**

This document defines the evidence method used to compare `@aster/svg` rendering and distribution
changes. It is not a product benchmark, a hardware-independent promise, or a CI performance
threshold. Current package findings remain in [SVG Quality](quality.md).

## Representative evidence

The baseline uses only public `@aster/core`, `@aster/icons`, and `@aster/svg` roots. Definitions and
options are prepared and frozen before timing begins, while every complete markup result enters a
deterministic checksum.

| Workload | Pressure represented |
| --- | --- |
| Core revalidation reference | Public reconstruction necessarily performed at the start of every SVG render. |
| Minimal icon | Fixed option, presentation, node, escaping, and complete-document cost. |
| Every primitive | Node dispatch, complete presentation, geometry attributes, and document composition. |
| Real corpus | Round-robin rendering across every canonical Aster icon shape. |
| Semantic accessibility | Label, title, accessible-name, escaping, and semantic root attributes. |
| Authorised overrides | Complete option normalisation and presentation override precedence. |
| RTL mirroring | Direction policy, translation, title ordering, and generated group composition. |
| Escaping pressure | XML validation and multiple replacements in attributes and text. |
| Dense point sequence | Core point reconstruction, coordinate conversion, flattening, and large markup composition. |

The Core reference is attribution evidence rather than an SVG product operation. It never grants
SVG permission to bypass revalidation or trust canonical object provenance.

## Initial evidence and attribution

Three complete reports under Node `24.10.0` on Windows x64 produced these medians across report
medians:

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
| Real corpus | 38,653 ns | 22,486 ns | 41.8% faster |
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
| Real corpus | 23,305 ns | 1,540 bytes |
| Semantic accessibility | 15,928 ns | 1,387 bytes |
| Authorised overrides | 15,331 ns | 2,720 bytes |
| RTL mirroring | 14,270 ns | 1,370 bytes |
| Escaping pressure | 16,523 ns | 1,665 bytes |
| Dense point sequence | 133,789 ns | 5,435 bytes |

Heap growth is a pressure indicator, not an allocation counter. No memory claim or compatibility
promise is inferred from these machine-specific values.

## Reproduction

Run the development-only comparison from a clean workspace:

```sh
pnpm benchmark:svg
```

The command builds Core, Icons, and SVG, runs Node with explicit garbage-collection access, prints
schema-version-one JSON, and writes no artefact. Reports include environment identity, methodology,
timing, heap pressure, checksums, emitted modules and declarations, bytes, exports, and side-effect
metadata.

## Acceptance rules

Correctness takes precedence over performance. A claim requires three equivalent control and
candidate reports, at least 10% improvement in its target scenario, and no unrelated regression
above 5% without an accepted trade-off. Distribution growth requires one concrete responsibility.
Runtime, type, ABI, architecture, documentation, and workflow conformance remain authoritative.

Caches, registries, mutable memoisation, pretrusted definitions, output streaming, weakened
validation, and private package imports are never benchmark shortcuts. Raw reports and CPU profiles
are machine-specific disposable evidence and are not committed.

## Tooling boundary

SVG owns its fixture factory, scenario runner, composition factory, and command. Generic timing,
heap, statistics, Node-host, repository, and distribution capabilities remain shared private
tooling. Neither layer is shipped by SVG or imported by production packages.
