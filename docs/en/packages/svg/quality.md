# SVG Quality

Status: **Accepted**

This page owns conformance evidence for `@luscious-garden/aster-svg`.
[API](api/index.md) specifies the public surface; [Render](render/index.md) specifies output;
[Error](error/index.md) specifies failures. [Quality Baseline](quality-baseline.md) owns
measurements, distribution snapshots and the retained escaping experiment.

## Evidence coverage

| Evidence | Guarantees exercised | Behaviour authority |
| --- | --- | --- |
| Renderer runtime suite | Exact markup and renderer marker, every primitive and structured path command, stable paint and attribute order, authorised overrides, viewport bounds, accessibility and RTL including numeric extremes. | [Render Result](render/index.md). |
| Adversarial renderer cases | Exact own option data, null prototypes, symbols, hidden fields, accessors, inherited state, malformed definitions, caller non-mutation and propagated proxy failures. | [Render Runtime](render/runtime/index.md#option-acceptance) and [Error](error/index.md). |
| XML cases | Exact XML 1.0 ranges, valid supplementary characters, isolated surrogate rejection, contextual escaping and logical source paths. | [Numeric and Text Form](render/index.md#numeric-and-text-form). |
| Icons corpus suite | Complete real artwork under default, semantic, colour-context, viewport and direction scenarios. | The public rendering contract applied to real consumers. |
| Type suite | The structural API and string result; rejection of arbitrary attributes, events, explicit undefined option fields and DOM values. | [API](api/index.md) and [Core Render Options](../core/render/index.md). |
| Built-package ABI suite | Exact root exports and declarations, unsupported implementation subpaths, Core-only runtime dependency, ESM and side-effect metadata, no undeclared host or tooling authority. | [Package Boundary](index.md#boundary). |
| Isolated consumer suite | Import and deterministic rendering using only publishable Core and SVG files, without repository sources. | [Project Testing Policy](../../project/testing.md). |
| Repository workflow suite | Byte-equivalent output from equivalent TypeScript-first and Import-adopted definitions through built public roots. | [Workflow](workflow.md). |

Runtime evidence distinguishes ordinary accessor rejection from caller-controlled proxy execution.
Public Core errors encountered during definition acceptance are translated by identity; exceptions
from option reflection are not part of that translation boundary.

## Consumer conformance

Repository authoring uses standalone markup for review and derived artefacts. CLI export and
static review render selected definitions through the public SVG root before composing their own
output. Those hosts own files, catalogues and presentation around the result.

Import adopts external source into portable values; SVG renders portable values towards a target.
Neither operation promises round-trip acceptance. The
[package dependency graph](../index.md) distinguishes production dependencies from development
fixtures, including SVG's test-only use of Icons.

## Retained design

The [runtime composition](render/runtime/index.md) keeps contexts and intermediate values local
to one call. The [escaping comparison](quality-baseline.md#retained-experiment) justifies the
single-pass algorithm, not weakened Core revalidation, trusted-definition shortcuts, caches or
output streaming.

No implemented consumer requires a second public renderer operation. New batch, fragment, file,
DOM or extension capabilities require their own ownership and failure contract under the
[compatibility policy](../../project/versioning.md). Splitting cohesive stateless classes or
adding base classes solely to match a preferred pattern is not conformance evidence.
