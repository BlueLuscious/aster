# Import

Status: **Private pre-release**

`@aster/import` is the host-independent adoption compiler for explicitly acquired external icon
sources. It inspects untrusted input, returns a metadata-free portable draft, combines that draft
with complete host-reviewed Core metadata, and emits an editable `.icon.ts` module.

Import owns no filesystem, terminal, process, network, discovery, overwrite, cleanup, collection
membership or generated-package authority. The emitted module becomes human-owned source
immediately and depends only on [`@aster/core`](../core/index.md).

## Features

- [API](api/index.md) defines the immutable public composition.
- [Adoption](adoption/index.md) defines drafts, definition construction and editable emission.
- [Diagnostics](diagnostic/index.md) defines stable source evidence and result envelopes.
- [Errors](error/index.md) defines malformed API invocation failures.
- [Formats](format/index.md) defines the closed built-in format authority.
- [SVG adapter](formats/svg/index.md) owns the initial external format implementation.
- [Source](source/index.md) defines explicit acquired-source boundaries.
- [Shared](shared/index.md) contains genuinely transversal private validation.
- [Workflow](workflow.md) defines operation composition and host hand-off.
- [Quality](quality.md) records safety, isolation, determinism and conformance evidence.
- [Compatibility](compatibility.md) defines the private distribution and consumer boundary.

## Flow

1. A host acquires and decodes a source without granting Import host authority.
2. `IconImport.inspect()` isolates it and delegates to its exact format adapter.
3. Successful inspection returns deeply frozen geometry and technical review evidence.
4. `IconImport.define()` delegates complete construction to public Core authority.
5. `IconImport.emit()` returns deterministic editable TypeScript with informational provenance.
6. `adopt()` composes those stages; `adoptMany()` adds atomic collision checks and canonical order.

The package is private while its first real host and additional format evidence remain deferred.
Its package boundary is hardened independently from those future host decisions.
