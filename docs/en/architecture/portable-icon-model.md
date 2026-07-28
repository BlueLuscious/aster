# Portable Icon Model

Status: **Accepted**

This document defines the target-independent geometry model produced from canonical SVG sources.
It does not define parser syntax, renderer handles, framework components, or generated module
layout.

## Model choice

Aster uses a minimal discriminated object model.

| Candidate | Decision | Reason |
| --- | --- | --- |
| Positional tuple nodes | Rejected as the canonical model | They are compact, but attribute positions are brittle, difficult to review, and expensive to extend compatibly. |
| General SVG AST | Rejected as the canonical model | It exposes parser details, unsafe syntax, namespaces, and browser-oriented features that runtime consumers do not need. |
| Discriminated object nodes | Accepted | They provide explicit fields, stable narrowing, serialisability, and controlled extension without importing DOM types. |

The model intentionally represents a portable subset of SVG geometry rather than every SVG
feature. Source syntax and the portable model have separate ownership.

## Definition shape

One portable icon definition contains:

| Field | Meaning |
| --- | --- |
| `identity` | The canonical collection, icon, and optional variant identity. |
| `viewBox` | Four finite numbers: minimum x, minimum y, width, and height. |
| `nodes` | A non-empty, ordered, read-only sequence of portable geometry nodes. |
| `metadata` | Only resolved metadata required by runtime, redistribution, or target adapters. |

Identity follows
[Metadata and Identity Boundary](metadata-and-identity-boundary.md). Geometry cannot override
identity, and object shape cannot substitute for it.

The viewBox width and height must be greater than zero. A definition does not carry pixel size,
DOM namespace state, renderer state, or framework ownership.

## Initial node kinds

The accepted initial node kinds are:

| Kind | Geometry |
| --- | --- |
| `path` | Canonical, validated SVG path data. |
| `circle` | Centre x, centre y, and positive radius. |
| `ellipse` | Centre x, centre y, positive x radius, and positive y radius. |
| `rect` | X, y, non-negative width and height, and optional corner radii. |
| `line` | Start and end coordinate pairs. |
| `polyline` | An ordered sequence of at least two coordinate pairs. |
| `polygon` | An ordered sequence of at least three coordinate pairs. |

Supported primitives remain primitives. Aster does not convert every shape to a path merely to
make one renderer simpler. A path remains a path and its data is syntax-validated before it enters
the portable model.

The root `svg` element and structural `g` elements are source syntax, not portable nodes. The
normaliser flattens source structure while preserving paint order and resolving allowed inherited
presentation values.

## Presentation data

Presentation is represented through explicit optional fields, not an arbitrary attribute map.
The initial model may carry:

- fill paint and fill rule;
- stroke paint, width, line cap, line join, and mitre limit;
- overall, fill, and stroke opacity.

Paint is a closed portable value: `none`, the external SVG token `currentColor`, or a canonical
literal sRGB colour. Arbitrary CSS, custom properties, URLs, gradients, patterns, filters, classes,
inline style text, and event attributes cannot enter the model.

Omitted presentation fields retain the model's documented defaults. A normaliser must not encode
the same effective presentation through multiple equivalent shapes.

## Numeric and textual values

Geometry numbers are finite ECMAScript numbers. Units, percentages, `calc()`, `NaN`, infinities,
and environment-dependent numeric forms are rejected. Negative zero is normalised to zero.

Canonical generation uses the shortest decimal representation that round-trips to the accepted
number. It does not round, quantise, or otherwise alter geometry for visual optimisation.

Source order is retained because node order determines painting. Coordinate sequences retain their
declared order. Textual enumerations use Aster-owned closed values, except where an exact external
token is part of the portable contract.

The portable model carries no namespace declarations. The parser validates the SVG namespace
before normalisation, and foreign namespace content is rejected.

## Unsupported source features

Executable, externally resolved, raster, and document-oriented SVG features are outside the
portable model. This includes:

- scripts and event handlers;
- external references, links, images, and embedded documents;
- `use`, `foreignObject`, text, animation, and style sheets;
- definitions, gradients, patterns, masks, clipping paths, and filters;
- editor-specific metadata that has no accepted metadata consumer.

Transforms are not accepted by the initial normalisation contract. A future transform normaliser
may be introduced only if it resolves transforms exactly and deterministically into supported
geometry. Until then, a transform is an unsupported-input error rather than a silent visual
rewrite.

## Immutability and serialisability

Portable definitions are deeply immutable after construction:

- every public field is read-only;
- node and coordinate sequences cannot be mutated;
- shared instances cannot expose mutable nested values;
- runtime construction freezes objects and arrays at their ownership boundary.

The data remains serialisable as plain values. It contains no functions, class instances, symbols,
dates, cyclic references, `undefined`, non-finite numbers, DOM objects, or framework objects.
Freezing protects an in-memory instance but does not change its serialised value.

Renderers and framework adapters consume the same definition without mutating it. Target-specific
handles and lifecycle state belong to their adapters, never to the icon definition.

## Extension rule

A new node kind or presentation field requires:

- a real source and consumer that cannot be represented by the accepted model;
- deterministic parsing, validation, and generation rules;
- a safety analysis;
- conformance evidence across every claimed target;
- a compatibility decision for previously generated definitions.

The model does not expand solely to mirror an available SVG feature.
