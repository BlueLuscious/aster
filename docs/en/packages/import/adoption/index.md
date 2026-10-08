# Import Adoption

Adoption owns the format-neutral hand-off from inspected geometry to Core definitions and editable
TypeScript. The [API](../api/index.md) composes the operations; the host owns review and persistence.

## Contracts

| Contract | Responsibility and relations |
| --- | --- |
| `IconImportDraft` | Metadata-free Core identity, view box and ordered nodes, with `IconImportMetrics` and `IconImportProvenance`. |
| `IconImportMetrics` | Primitive count and expanded portable path-command count for technical review and consistency checks. |
| `IconImportProvenance` | Exact `IconImportFormatType` and host-owned logical source identifier. |
| `IconImportDefinitionRequest` | Pairs one draft with complete host-reviewed Core `IconMetadata`. |
| `IconModuleEmissionRequest` | Pairs a Core `IconDefinition` with non-empty canonical logical `sourceIds`. |
| `IconModuleOutput` | Deterministic exported symbol, suggested relative authored path and complete LF-terminated editable content. |
| `IconAdoptionRequest` | Combines an explicit `IconImportSourceType` with complete reviewed metadata. |
| `IconAdoptionOutput` | Retains the successful draft, Core definition and editable module. |
| `IconAdoptionBatchOutput` | Contains canonically ordered complete adoption entries, never partial success. |

`TIconAdoptionDiagnosticDetails` derives private code/message evidence from the immutable adoption
diagnostic authority and is completed by the [diagnostic boundary](../diagnostic/index.md).

## Definition construction

Supplied drafts must have the complete closed envelope, a positive primitive count, a non-negative
path-command count, a built-in format and a canonical logical source identifier. Core then validates
and isolates identity, view box, geometry and reviewed metadata through `Icon.define()`.

Metrics must match the canonical node count and sum of portable path-command counts. Invalid
envelopes or inconsistent metrics throw `IconImportError`; invalid Core geometry or metadata
returns blocking adoption diagnostics. Matching metrics prove internal consistency, not that a
separately supplied draft originated from its claimed source.

## Editable emission

Emission revalidates the definition through Core and uses deterministic JSON-compatible
TypeScript literals. Path nodes contain structured commands rather than raw SVG `d` text.
Source identifiers are informational provenance, not acquisition instructions.

Output has no generated ownership marker, overwrite policy or rebuild lifecycle. Its only runtime
dependency is Core. Once persisted, it is ordinary human-owned source; Import retains no relation
that can regenerate or replace it.

## Atomic adoption

`adopt()` stops at the first blocking stage. `adoptMany()` requires a non-empty batch, rejects
duplicate portable identities and emitted-symbol collisions, and returns canonical identity order.
Any blocking entry or collision rejects the whole batch without partial output.

Collection grouping is host-owned: one host-prepared batch is not a collection definition or
cross-collection transaction. Successful graphs and diagnostic results are deeply frozen and
isolated from later caller mutation.
