# 0011: Private External-source Adoption Compiler

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-08-28**

Affected documents:

- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [SVG Processing Pipeline](../architecture/svg-processing-pipeline.md)
- [`@aster/import`](../packages/import/index.md)

Supersedes:

- [0002: Private Build-time Domain Package](0002-private-build-time-domain-package.md)
- [0004: JSON Metadata for SVG Imports](0004-canonical-json-metadata-sources.md)

Superseded by: **None**

## Context

The former private Build package combined safe SVG ingestion with JSON metadata decoding,
collection policy, package generation, overwrite planning, and generated-file ownership. Aster's
canonical authoring model is now TypeScript-first, while external SVG remains useful as an optional
source from which a human can adopt geometry.

Keeping the broader Build boundary would preserve responsibilities for which no current product
workflow exists. Removing external-source ingestion entirely would discard tested safety,
normalisation, and diagnostic behaviour that has independent value.

## Decision drivers

- Preserve host-independent inspection of untrusted external sources.
- Keep complete icon metadata under explicit host and Core authority.
- Produce editable source rather than permanently generated output.
- Exclude filesystem, discovery, overwrite, cleanup, package scaffolding, and process effects.
- Permit additional source formats without widening the initial public package surface.

## Options

### Retain the former Build package

This would keep mature implementation code but retain unused metadata, collection-generation, and
generated-output ownership contracts.

### Remove external-source ingestion

This would simplify the workspace but eliminate a useful and already evidenced adoption path.

### Replace Build with a narrow private Import package

This preserves format adapters and portable adoption while deleting speculative host and
generation responsibilities.

## Decision

Aster replaces `@aster/build` with the private `@aster/import` package.

Import receives explicitly acquired source values. Its format adapters inspect untrusted content
and return immutable metadata-free drafts with Aster-owned diagnostics. A host supplies complete
reviewed [`IconMetadata`](../packages/core/metadata/index.md), and Import delegates final definition
construction to `@aster/core` before emitting deterministic editable `.icon.ts` source.

The initial SVG adapter owns XML parsing, safety limits, portable-subset validation,
normalisation, and finite editor-noise policy. Import owns no filesystem, terminal, process,
network, source discovery, overwrite, cleanup, collection membership, package generation, or
generated-file lifecycle.

Single adoption and atomic batches are supported. Collection-scale ingestion is host composition
over explicit batch inputs, not an Import-owned collection pipeline.

## Consequences

### Positive

- External SVG can become portable Aster source without becoming a canonical editable authority.
- Core remains the sole authority for icon definitions and metadata validity.
- Emitted TypeScript becomes human-owned immediately and can later be exported through `@aster/svg`.
- Future source formats can implement the private adapter boundary without changing host effects.

### Negative

- Hosts must acquire sources and provide reviewed metadata explicitly.
- Import remains private until a real CLI or programmatic host validates its integration surface.
- SVG parsing retains one exact third-party XML dependency behind an Aster-owned boundary.

### Deferred

- CLI import and review workflows.
- Additional source-format adapters.
- An Aster-owned XML tokeniser if conformance and maintenance evidence justify it.
- Public package status and compatibility commitments.

## Compatibility and migration

`@aster/build` was private and had no released compatibility promise. Its metadata decoder,
collection pipeline, package generator, overwrite planning, and generated-file authorities are
removed without aliases. Consumers must adopt the explicit `IconImport` workflow or remain on the
TypeScript-first Core and Icons path.

## Evidence

- [`@aster/import` package](../../../packages/import/package.json)
- [Import API](../packages/import/api/index.md)
- [Import adoption flow](../packages/import/adoption/index.md)
- [Import SVG adapter](../packages/import/formats/svg/index.md)
- [Representative authoring workflow](../../../tests/workflow/pilot-authoring-workflow.test.ts)
