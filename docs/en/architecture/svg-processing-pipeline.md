# SVG Adoption Pipeline

Status: **Accepted**

This document defines the optional host-independent path from explicitly acquired SVG text to a
portable Aster icon definition and editable TypeScript source. Canonical Aster authoring remains
TypeScript-first; SVG adoption is not a generated-file lifecycle.

## Ownership

`@aster/import` owns source isolation, parser-neutral diagnostics, safety validation, portable SVG
subset validation, normalisation, Core definition construction, and deterministic editable module
emission. A host owns filesystem or network acquisition, source discovery, reviewed metadata,
terminal presentation, persistence, overwrite policy, and process status.

The complete package flow is documented by [`@aster/import`](../packages/import/index.md).

## Stages

1. The host supplies an explicit source identity, logical icon identity, format discriminator, and
   decoded content.
2. Import isolates the value and selects the exact built-in format adapter.
3. The SVG adapter tokenises XML behind an internal parser boundary.
4. Aster-owned validation rejects malformed, executable, external, foreign, unsupported, or
   resource-exhausting input.
5. Normalisation resolves accepted hierarchy, geometry, and presentation into a deeply frozen
   metadata-free draft.
6. The host reviews diagnostics and supplies complete Core `IconMetadata`.
7. Import delegates immutable definition construction to `@aster/core`.
8. Import may serialise the accepted definition as deterministic editable `.icon.ts` source.

`adoptMany()` applies the same stages atomically, rejects identity collisions, and returns outputs
in canonical identity order. It does not infer collections or source layouts.

## Parser boundary

The initial SVG adapter pins `xmlsax-typescript` version `1.0.0`. Parser-library tokens, failures,
and messages remain internal. Aster independently owns source spans, character checks, document
shape, safety policy, resource limits, accepted SVG semantics, and result envelopes.

The dependency remains replaceable behind private contracts. Replacement requires conformance
evidence rather than API compatibility with the selected library.

## Accepted editor noise

A finite root-only policy accepts and discards safe XML declarations, comments, unused namespace
declarations, and recognised editor attributes. Every discarded editor attribute produces an
exact warning. Invalid values, foreign namespace use, resource references, processing instructions,
and unsupported semantics remain blocking.

The concrete policy is documented by [Import SVG Validation](../packages/import/formats/svg/validation/index.md).

## Normalisation limits

Normalisation may flatten accepted groups, resolve supported inherited presentation, canonicalise
finite values, and omit explicitly reviewed editor noise. It never repairs unsafe input, infers
missing intent, optimises geometry, converts strokes, or mutates the acquired source.

## Output ownership

Emitted TypeScript contains informational provenance only. It has no generated marker, rebuild
command, overwrite claim, stale-cleanup policy, or hidden source snapshot. Once emitted, it is
human-owned editable source. Later SVG output is independently derived through
[`@aster/svg`](../packages/svg/index.md).
