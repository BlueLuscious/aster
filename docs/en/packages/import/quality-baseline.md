# Import Quality Baseline

Status: **Accepted Baseline**

This baseline freezes the current observable Import boundary before implementation or performance
changes. It measures public operations and emitted distribution without granting Import filesystem,
process or discovery authority.

## Boundary inventory

The package has one public root. Its runtime surface contains `IconImport`, `IconImportError` and
`iconImportFormats`. The following declaration families are required by that root and are not
accidental implementation exports:

| Family | Public symbols | Reason retained |
| --- | --- | --- |
| API | `IconImportApi` | Describes the immutable public composition. |
| Adoption input | `IconAdoptionRequest`, `IconImportDefinitionRequest`, `IconModuleEmissionRequest` | Types each independently callable operation. |
| Adoption output | `IconAdoptionOutput`, `IconAdoptionBatchOutput`, `IconImportDraft`, `IconImportMetrics`, `IconImportProvenance`, `IconModuleOutput` | Exposes reviewable operation results without runtime classes. |
| Diagnostics | `DiagnosticRelatedContext`, `SourceDiagnostic`, `SourcePosition`, `SourceSpan`, `DiagnosticCategoryType`, `DiagnosticCodeType`, `DiagnosticResultType`, `DiagnosticSeverityType` | Types stable failure and advisory evidence returned by every operation. |
| Format and source | `SvgIconImportSource`, `IconImportFormatType`, `IconImportSourceType` | Defines the exact built-in source discriminator and current source union. |

All runtime implementation classes, adapter contracts, parser syntax, validation evidence and
internal diagnostic details remain inaccessible through package exports. Their final necessity is
subject to structural audit, but their current visibility is correct.

Import depends only on the public `@aster/core` root and the pinned `xmlsax-typescript` parser.
Core, Icons, SVG and CLI do not depend on Import. Emitted modules depend on Core rather than Import.
The package remains private ES2022 ESM, side-effect-free and available through one root export.

## Operation ownership

| Operation | Owned work | Successful allocation | Failure transition |
| --- | --- | --- | --- |
| `inspect()` | Isolates source input, resolves the exact format adapter, parses, validates and normalises source. | Deeply frozen draft, provenance, metrics and diagnostic sequence. | Malformed API structure throws; rejected source returns diagnostics without a value. |
| `define()` | Validates the request and delegates portable construction to Core. | Canonical Core definition and diagnostic envelope. | Invalid reviewed metadata becomes blocking adoption diagnostics. |
| `emit()` | Validates provenance and serialises one accepted definition. | Editable module content, symbol and suggested path. | Invalid definition or provenance becomes blocking adoption diagnostics. |
| `adopt()` | Composes inspection, definition and emission for one source. | Draft, definition and module plus merged diagnostics. | Stops at the first blocking stage and returns no partial adoption output. |
| `adoptMany()` | Repeats complete adoption, detects identity and symbol collisions, and sorts accepted output. | Frozen canonically ordered batch. | Any blocking entry or collision rejects the entire batch. |

Caller input remains host-owned. Import isolates accepted state and owns all successful output
graphs. Diagnostics are aggregated locally and frozen at the result boundary. Explicit caller
execution failures are not converted into Import diagnostics.

## Internal dependency map

The public API composes the adoption service and immutable built-in adapter registry. Adoption
depends on source isolation, format dispatch, diagnostics, Core definition construction and module
emission. The SVG adapter owns parser, safety, validation and normalisation features. Shared code
is limited to value validation, canonical slug normalisation and identity formatting used across
more than one Import feature.

Dependency direction runs from API to adoption and adapter composition, then inward to source,
diagnostic and SVG implementation authorities. Contracts do not depend on runtime classes. No
internal feature may import repository tooling or acquire host capabilities.

The largest current review surfaces are the SVG parser, basic-shape validator, path-data inspector,
adoption service, tag locator, primitive normaliser, value validator, geometry validator and
presentation validator. Their size identifies audit pressure only; it is not evidence that they
should be split. Refactoring requires a distinct owner, change pressure or duplicated behaviour.

## Conformance scenario families

| Family | Representative evidence | Authority |
| --- | --- | --- |
| Accepted | Minimal path source and complete single-source adoption. | Runtime and workflow conformance. |
| Editor export | Illustrator-style declarations, comments, namespace declarations, attributes and empty groups. | SVG adapter conformance. |
| Rejected | Executable elements, external resources, unsupported semantics and foreign namespaces. | SVG safety and subset conformance. |
| Malformed | Mismatched elements, duplicate attributes, invalid comments and multiple roots. | Parser conformance. |
| Adversarial | Reflective records, accessors, proxies, sparse arrays, cycles and configured parser limits. | Input-hardening and parser-limit conformance. |
| Batch | Independent requests, collisions, canonical ordering and collection-scale sets. | Adoption composition conformance. |

These correctness families define behaviour independently from timing. Only representative
accepted, editor-export, rejected and batch inputs enter the initial performance comparison.

## Performance comparison

Run:

```sh
pnpm benchmark:import
```

The command builds Core and Import, prepares all fixture state outside timed loops, runs Node with
explicit garbage-collection access, prints one JSON report and writes no artefact. The initial
fixtures contain a 167-byte minimal source, a 506-byte editor export, a 72-byte rejected source and
eight distinct batch requests. The report records those sizes, environment, methodology,
distribution shape and these scenarios:

| Scenario | Evidence |
| --- | --- |
| `import.inspect.minimal-svg` | Minimal accepted source parsing, validation and normalisation. |
| `import.inspect.editor-svg` | Accepted editor export containing finite known noise. |
| `import.inspect.rejected-svg` | Deterministic rejection of executable source without exception leakage. |
| `import.define.reviewed-draft` | Core construction from a pre-inspected draft and reviewed metadata. |
| `import.emit.editable-module` | Editable TypeScript serialisation from a pre-defined icon. |
| `import.adopt.single-svg` | Complete single-source composition. |
| `import.adopt.batch-svg` | Atomic adoption and canonical ordering of eight distinct requests. |

Warm-up and repeated in-process samples use the repository-wide benchmark methodology. A cold
process scenario is intentionally absent: Import has no executable, process lifecycle or host
startup contract. Rejected malformed and adversarial families remain correctness fixtures; the
representative executable-source rejection establishes the initial timed rejection path without
turning every safety rule into a performance target.

## Interpretation

Results are comparison evidence, not speed promises or CI thresholds. Timing and heap pressure are
compared only under equivalent machines, runtime revisions and fixture sizes. Distribution counts
describe unminified compiler output. A later optimisation must improve a material scenario without
weakening diagnostics, isolation, determinism, safety or package boundaries.
