# Import Adoption

Adoption owns the target-neutral hand-off from inspected geometry to editable TypeScript.

## Contracts

- `IconImportDraft` contains identity, view box, nodes, metrics and provenance without metadata.
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
