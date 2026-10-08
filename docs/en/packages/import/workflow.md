# Import Workflow

Import turns explicitly acquired source text into editable Aster source. It does not replace
TypeScript-first authorship or acquire host authority.

## Staged adoption

1. A host acquires and decodes input, assigns a logical source identifier and portable identity,
   and supplies the [source contract](source/index.md).
2. `IconImport.inspect()` isolates that input and selects the exact [format adapter](format/index.md).
3. The [SVG adapter](formats/svg/index.md) parses, validates and normalises supported source into
   a metadata-free draft, or returns blocking diagnostics.
4. The host reviews the draft and supplies complete Core metadata to `IconImport.define()`.
5. [Adoption](adoption/index.md) validates draft evidence and delegates construction to Core.
6. `IconImport.emit()` returns editable content and a suggested relative path.
7. The host handles diagnostics and decides whether and where to persist that content.

[`adopt()` and `adoptMany()`](api/index.md) compose these stages for pre-reviewed input.
Batch adoption adds all-or-nothing collision checks and canonical ordering; collection membership
and independent batch transactions remain host-owned.

## Retained source

A persisted module imports only Core. It compiles and renders through SVG without Import, the
original input or an external metadata file. Nothing grants Import overwrite, cleanup or generated
ownership over that source.

Supported SVG commands normalise into Core's absolute structured commands. Equivalent adopted and
TypeScript-authored definitions render equivalently with matching metadata/options; original SVG
spelling is not preserved. Complete renderer output is not necessarily accepted Import input:
the [adapter boundary](formats/svg/index.md) explicitly rejects unsupported output attributes.

## Failure hand-off

[Errors](error/index.md) distinguish malformed API structure from
[diagnostic rejection](diagnostic/index.md). A blocking stage returns no partial value; explicit
caller execution failures are not relabelled. Hosts must resolve failures before persistence.
[Quality](quality.md) owns staged, batch and independent-consumer evidence.
