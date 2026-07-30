# Private Build Domain

Status: **Accepted**

`@aster/build` owns reusable build-time domain services that import explicitly acquired SVG and
JSON metadata into deterministic portable definitions and generation plans. It is a private
workspace package, not a published runtime dependency and not a requirement for directly authored
Core definitions.

## Current boundary

The implemented boundary accepts exact textual source descriptors, decodes closed version-one JSON
metadata, parses the accepted SVG syntax subset behind an internal trust boundary, validates
universal technical invariants and collection-owned visual rules, and normalises successful
evidence into Core definitions. It plans deterministic collection TypeScript modules, package
configuration, public package subpaths, and safe stale-file candidates. `CollectionBuildPipeline`
composes that complete pure flow and returns output only after every blocking stage succeeds.
Filesystem and process authority remain outside Build.

## Features

| Feature | Responsibility |
| --- | --- |
| [Shared](shared/index.md) | Cross-feature immutable SVG vocabularies and primitive build-service assertions. |
| [Source](source/index.md) | Canonical textual source descriptors and exact UTF-16 locations. |
| [Diagnostic](diagnostic/index.md) | Stable diagnostics, deterministic aggregation, and success or failure results. |
| [Parser](parser/index.md) | Internal parser-neutral SVG syntax, source spans, subset behaviour, and blocking safety policy. |
| [Validation](validation/index.md) | Internal identity, technical, geometry, presentation, and collection-rule validation. |
| [Normalisation](normalisation/index.md) | Internal deterministic conversion of accepted evidence and decoded metadata into Core definitions. |
| [Generator](generator/index.md) | Internal deterministic module, package, export, diagnostic, and cleanup planning without filesystem authority. |
| [Metadata](metadata/index.md) | Internal strict version-one JSON decoding and stable source rejection diagnostics. |
| [Pipeline](pipeline/index.md) | Public host-independent composition of canonical sources into complete generated package text. |

## Dependency boundary

The package depends directionally on public `@aster/core` contracts for stable portable domain
concepts. Source acquisition reuses `IconIdentity`; validation reuses `IconViewBox`; normalisation
produces definitions through the public `Icon.define()` API. Build does not import Core
implementation paths, including `core/src/shared/`, or grant untrusted source values portable
authority.

The package also pins `xmlsax-typescript` version `1.0.0`. That dependency has no transitive
production packages and is confined to the internal `SvgParser` adapter. Production compilation
uses ES2022 without Node, DOM, browser, Lilium, Lotus, or repository-tooling ambient types.

The package cannot depend on a renderer, framework adapter, collection package, host ecosystem,
or repository tooling.

## Workspace surface

The private root export provides:

| Symbol family | Kind | Responsibility |
| --- | --- | --- |
| Source and diagnostic contracts and types | Type-only exports | Describe accepted source, location, diagnostic, and result values. |
| `IngestionSourceFactory` | Class | Validates, isolates, and freezes canonical source descriptors. |
| `SourceLocator` | Class | Resolves exact UTF-16 offsets to one-based display positions. |
| `SourceDiagnosticFactory` | Class | Validates and deeply freezes Aster-owned diagnostics. |
| `SourceDiagnosticAggregator` | Class | Deduplicates and orders diagnostics canonically. |
| `DiagnosticResultFactory` | Class | Creates explicit successes and failures without host process authority. |
| Pipeline contracts | Type-only exports | Describe acquired source pairs, existing text, and complete successful output. |
| `CollectionBuildPipeline` | Class | Composes metadata, SVG, validation, normalisation, and generation without effects. |

Only the package root is an approved workspace import. Runtime implementation paths remain
internal. Parser, metadata implementation, validation, normalisation, and generator classes,
internal service contracts, syntax and evidence contracts, collection rule configuration,
generation plans, templates, and parser-library values are deliberately absent from the root
surface.

## Domain flow

1. A host adapter strictly decodes selected import bytes and supplies a source descriptor
   explicitly.
2. `IngestionSourceFactory` validates logical identity, path, and text invariants without changing
   content.
3. `SvgParser` converts library tokens immediately into an internal Aster-owned syntax model,
   while independently enforcing document shape, source spans, subset behaviour, and safety.
4. `SvgValidator` verifies identity and metadata pairing before composing universal technical
   checks with accepted collection-owned rules.
5. Technical validation produces metrics only from trustworthy parsed values; collection rules
   cannot weaken safety or technical constraints.
6. `JsonMetadataDecoder` supplies structured collection and icon values behind a replaceable
   decoder contract without exposing serialisation technology to later stages.
7. `SvgNormaliser` links those values to successful evidence, resolves inherited source
   representation, composes metadata authority, and constructs each result through `Icon.define()`.
8. `GenerationPlanner` derives stable names, renders isolated modules, package configuration and
   aggregate exports, detects generation conflicts, and analyses stale owned files without
   committing output.
9. `CollectionBuildPipeline` composes those stages into complete generated text and stale paths.
10. Domain stages create Aster-owned reports through `SourceDiagnosticFactory`.
11. `SourceDiagnosticAggregator` deduplicates and orders independent reports deterministically.
12. `DiagnosticResultFactory` returns complete output with warnings or failure with blocking
   diagnostics and no partial output.

Filesystem discovery, terminal formatting, and process exit status stay outside this flow.

The accepted package decision is recorded by
[Private Build-time Domain Package](../../decisions/0002-private-build-time-domain-package.md). The
parser dependency and replacement boundary is recorded by
[Private XML Parser Boundary](../../decisions/0003-private-xml-parser-boundary.md).
