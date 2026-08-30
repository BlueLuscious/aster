# Import Workflow

Import transforms explicitly acquired external source text into canonical editable Aster source
without acquiring host authority or replacing TypeScript-first authorship.

## Operation flow

1. A host acquires bytes, decodes text and assigns a logical `sourceId` and icon identity.
2. `IconImport.inspect()` isolates the source and selects its exact built-in format adapter.
3. The adapter returns either blocking diagnostics or a deeply frozen metadata-free draft.
4. The host reviews evidence and supplies complete portable Core metadata.
5. `IconImport.define()` delegates canonical construction to `Icon.define()`.
6. `IconImport.emit()` returns deterministic editable `.icon.ts` content and a suggested path.
7. `IconImport.adopt()` composes the preceding operations atomically for one icon.
8. `IconImport.adoptMany()` composes a non-empty batch, rejects collisions and returns canonical
   identity order without partial output.

The host decides whether and where to persist emitted content. Import never reads directories,
writes files, replaces existing source, tracks stale output or controls process status.

## Composition scale

A single icon uses `adopt()`. A host-prepared set of icons uses `adoptMany()`. One collection is a
batch selected by the host, not a distinct Import value. Several collections remain independent
batch calls so their membership, naming, review and commit boundaries do not leak into Import.

The emitted module imports only `@aster/core`. Once retained as canonical authored source, it
compiles, imports and renders through `@aster/svg` without `@aster/import`, the original SVG or
external metadata files.

Repository conformance exercises both direct TypeScript-first authorship and adopted editable
modules through the built Core, Import and SVG package roots. Independent host-owned batches are
converted back through `Icon.define()` and rendered without introducing an Import dependency into
the retained definitions or their collection grouping.

## Failure flow

Malformed public structure throws `IconImportError`. Validly shaped source or metadata that cannot
be adopted returns stable diagnostics without a partial value. Caller-controlled execution
failures, including explicit `Proxy` trap failures, are not relabelled as Import diagnostics.
