# Build Generator

Status: **Accepted**

The generator feature converts complete portable definitions into a deterministic collection
module plan. It is internal to `@aster/build`: its contracts, types, authorities, templates, and
runtime classes are absent from the package root.

Generation planning is pure. It accepts explicit values and an optional snapshot of existing text
files, then returns complete planned content, public package subpaths, and safe stale paths. It
does not inspect directories, read or write files, resolve absolute output roots, terminate a
process, compile modules, or commit partial output.

## Internal contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IExistingGeneratedFile` | Carries one existing generated-root-relative path and its exact text content. | Supplied by a future filesystem host; analysed by `GeneratedCleanupPlanner`. |
| `IGenerationEntry` | Associates one portable `IconDefinition` with its canonical metadata provenance. | Accepted as part of `IGenerationRequest`; converted to `TGenerationCandidate`. |
| `IGenerationRequest` | Carries collection provenance, collection slug, intended package name, definitions, and an optional existing-file snapshot. | Input to `IGenerationPlanner`; normalised by `GenerationRequestNormaliser`. |
| `IPlannedFile` | Carries one complete generated-root-relative path and LF-terminated UTF-8 text content. | Retained by `IGenerationPlan`; consumed by a future filesystem host. |
| `IPlannedPackageExport` | Associates one public collection-package subpath with its generated TypeScript source module. | Retained by `IGenerationPlan`; used by later package emission. |
| `IGenerationPlan` | Carries the complete ordered file, export, and stale-path plan for one collection package. | Successful output of `IGenerationPlanner`. |
| `IGenerationPlanner` | Defines pure diagnostic-bearing collection-package planning. | Implemented by `GenerationPlanner`; returns `DiagnosticResultType<IGenerationPlan>`. |

All paths in requests and plans are relative to an externally configured generated root and use
`/` separators. Absolute paths, drive-qualified paths, empty segments, current segments, and
parent segments are invalid service input. This representation makes escaping the generated root
unrepresentable in a successful domain plan; the filesystem host remains responsible for
symlink-safe resolution and atomic commit.

## Internal types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `TGeneratedIconName` | Carries one stable identity key, TypeScript symbol, module path, public subpath, and manifest key. | Created by `GeneratedIconNameFactory`. |
| `TGenerationCandidate` | Pairs an accepted `IGenerationEntry` with its `TGeneratedIconName`. | Canonical planning value used by templates and collision detection. |
| `TGeneratedCleanupPlan` | Separates stale owned paths from planned paths occupied by unowned files. | Output of `GeneratedCleanupPlanner`. |
| `TGenerationIssue` | Represents duplicate identity, symbol collision, reserved subpath, or output-ownership evidence. | Mapped to `ASTER-GENERATION-*` diagnostics by `GenerationDiagnosticFactory`. |

## Feature-owned authorities

| Authority | Responsibility |
| --- | --- |
| `generatedFileMarker` | Defines the exact first line proving Aster ownership of generated text files. |
| `generationIssueKinds` | Defines every blocking generation-planning evidence discriminator. |
| `generatorModulePaths` | Defines the generated icon root, collection root module, and manifest module paths. |
| `generatorReservedSubpaths` | Reserves `./manifest` for the opt-in collection registry. |

These authorities are internal implementation values. Generated banners and output modules are
observable artefacts, but no authority is exported from `@aster/build`.

## Naming model

Canonical icon and variant slugs remain the package-subpath authority. Generated TypeScript
symbols use PascalCase segments:

| Identity | Symbol | Module | Public subpath |
| --- | --- | --- | --- |
| `camera` | `Camera` | `src/icons/camera.ts` | `./camera` |
| `camera/filled` | `CameraFilled` | `src/icons/camera/filled.ts` | `./camera/filled` |
| `3d-axis` | `Icon3dAxis` | `src/icons/3d-axis.ts` | `./3d-axis` |

Using `<name>.ts` for a base icon allows variant modules to coexist beneath a same-named directory
without reserving `index` as a variant. A symbol beginning with a number receives the semantic
`Icon` prefix. PascalCase makes JavaScript reserved words such as `class` valid exported
identifiers, while collisions after transformation remain blocking diagnostics. Generated module
bindings use a `$` prefix, which canonical portable identity cannot derive, so authored symbols
cannot collide with Core or manifest internals.

`./manifest` is reserved because it identifies the opt-in registry. Per-icon modules and the
collection root never import that manifest.

## Planned module templates

| Class | Responsibility |
| --- | --- |
| `GeneratedFileBannerFactory` | Emits stable ownership, canonical source, rebuild, and editing-policy lines without timestamps or absolute paths. |
| `TypeScriptValueSerialiser` | Produces stable indented TypeScript-compatible literals and escapes JavaScript line separators. |
| `IconDefinitionTemplate` | Emits one `Icon.define()` expression through public `@aster/core` authority. |
| `IconModuleTemplate` | Emits one isolated definition module importing only `@aster/core`. |
| `CollectionIndexTemplate` | Emits canonically ordered convenience re-exports without importing the manifest. |
| `CollectionManifestTemplate` | Emits the explicit opt-in immutable registry and its complete imports. |
| `GeneratedModuleSpecifierFactory` | Converts generated `src/**/*.ts` paths into relative `.js` ESM specifiers. |

Generated text uses UTF-8-compatible source, LF line endings, stable two-space literal
indentation, semicolons, and one terminal newline. Each module begins with:

```text
// @generated by @aster/build.
// Sources: ["canonical/source.json"]
// Rebuild: pnpm aster:build
// Do not edit manually.
```

Source identifiers are represented as JSON strings so authored text cannot inject generated
comment lines.

## Planning composition

| Class | Responsibility |
| --- | --- |
| `GenerationRequestNormaliser` | Validates exact request fields, canonical paths, collection identity, package name, existing files, and non-empty entries; re-establishes definition authority through `Icon.define()`. |
| `GeneratedIconNameFactory` | Derives all stable names from canonical portable identity. |
| `GeneratedCleanupPlanner` | Finds obsolete files carrying the exact ownership marker and detects planned overwrites of unowned files. |
| `GenerationDiagnosticFactory` | Maps internal issue evidence to stable blocking Generation diagnostics. |
| `GenerationPlanner` | Orchestrates validation, canonical ordering, collision detection, templates, exports, cleanup analysis, and diagnostic-bearing results. |

The planner sorts definitions by slash-separated portable identity using Unicode code-unit order.
Files sort by generated-relative path and package exports sort by subpath. Input enumeration order
cannot change the result.

## Diagnostics

| Code | Meaning |
| --- | --- |
| `ASTER-GENERATION-001` | The same portable identity occurs more than once. |
| `ASTER-GENERATION-002` | Different portable identities derive the same TypeScript symbol. |
| `ASTER-GENERATION-003` | An icon attempts to use the reserved `./manifest` infrastructure subpath. |
| `ASTER-GENERATION-004` | A planned path is occupied by a file without the Aster ownership marker. |

Duplicate identity and symbol diagnostics retain the first conflicting source as related context.
All diagnostics flow through the canonical
[Build Diagnostic](../diagnostic/index.md) aggregation and result boundary.

Malformed service objects raise `BuildContractError`; expected generation conflicts return failed
diagnostic results with no partial plan.

## Cleanup boundary

An existing file is stale only when:

- its path is canonical and relative to the generated root;
- its exact first line is `generatedFileMarker`;
- its path is absent from the complete new plan.

Human-owned files absent from the plan are ignored. A human-owned file occupying a planned path
blocks the complete result rather than being overwritten. Actual deletion, staging, symlink
protection, replacement, and interruption recovery remain filesystem-host responsibilities.

## Implemented boundary

The implemented feature plans TypeScript definition modules, collection convenience exports, an
opt-in manifest, public package subpaths, and stale owned text files. It does not yet emit a
package manifest or compiler configuration, create a generated package, or write output. Those
responsibilities require built-package evidence and belong to the generated-module and
end-to-end host boundaries.

The repository-wide determinism contract is
[Diagnostics and Determinism](../../../architecture/diagnostics-and-determinism.md). Package
capabilities and manifest isolation are defined by
[Distribution and Adapters](../../../architecture/distribution-and-adapters.md).
