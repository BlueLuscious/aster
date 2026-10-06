# Import Adoption

Adoption owns the target-neutral hand-off from inspected geometry to editable TypeScript.

## Contracts

- `IconImportDraft` contains deeply frozen identity, view box, nodes, metrics and provenance
  without metadata.
- `IconImportMetrics` records primitive and path-command review facts.
- `IconImportProvenance` records the exact format and logical source identifier.
- `IconImportDefinitionRequest` pairs one draft with complete `IconMetadata`.
- `IconModuleEmissionRequest` pairs one accepted definition with logical provenance.
- `IconModuleOutput` contains an exported symbol, suggested authored path and editable content.
- `IconAdoptionRequest` combines one explicit source with reviewed metadata.
- `IconAdoptionOutput` contains the draft, Core definition and editable module.
- `IconAdoptionBatchOutput` contains canonically ordered all-or-nothing entries.
- `TIconAdoptionDiagnosticDetails` derives the internal diagnostic code and message shape from the
  immutable adoption diagnostic authority.

Definition construction always delegates to `Icon.define()`. Emission revalidates the definition,
uses deterministic JSON-compatible TypeScript literals and never emits generated ownership,
overwrite or rebuild policy. Batch adoption rejects duplicate identities and symbol collisions
without returning partial output.

`IconImport.define()` accepts an inspected or otherwise supplied draft only after validating its
complete field set, non-empty primitive count, non-negative path-command count, built-in format and
canonical logical source identifier. Core then validates and isolates identity, view box, geometry
and reviewed metadata. A successful definition also requires `primitiveCount` to match its canonical
node count and `pathCommandCount` to match the sum of its canonical path command counts. Invalid
draft envelope or inconsistent metrics throw `IconImportError`; invalid Core geometry or metadata
returns a blocking adoption diagnostic. Matching metrics establish internal consistency, not proof
that a separately supplied draft came from its stated source.

One collection is represented by one host-prepared `adoptMany()` request. Several collections are
independent calls whose grouping remains host-owned. Import has no collection registry, membership
model or cross-collection transaction because no current consumer requires those responsibilities.

Every successful adoption value and every failed diagnostic result is deeply frozen. Import does
not retain mutable source, metadata, provenance arrays or batch requests supplied by the caller.
