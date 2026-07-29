# Private Build Domain

Status: **Accepted**

`@aster/build` owns reusable build-time domain services that transform canonical collection
sources into deterministic portable inputs and generation plans. It is a private workspace
package, not a published runtime dependency.

## Current boundary

The implemented boundary accepts exact textual source descriptors, parses the accepted SVG
syntax subset behind an internal trust boundary, and produces stable diagnostic-bearing results.
It has no filesystem adapter, semantic validator, normaliser, generator, command-line adapter, or
generated output authority yet.

## Features

| Feature | Responsibility |
| --- | --- |
| [Source](source/index.md) | Canonical textual source descriptors and exact UTF-16 locations. |
| [Diagnostic](diagnostic/index.md) | Stable diagnostics, deterministic aggregation, and success or failure results. |
| [Parser](parser/index.md) | Internal parser-neutral SVG syntax, source spans, subset behaviour, and blocking safety policy. |

## Dependency boundary

The package pins `xmlsax-typescript` version `1.0.0` as its sole production dependency. The
dependency has no transitive production packages and is confined to the internal `SvgParser`
adapter. Production compilation uses ES2022 without Node, DOM, browser, Lilium, Lotus, or
repository-tooling ambient types.

Future ingestion stages may depend on public `@aster/core` contracts when those contracts own real
behaviour. The package cannot depend on a renderer, framework adapter, generated collection, host
ecosystem, or repository tooling.

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

Only the package root is an approved workspace import. Runtime implementation paths remain
internal. Parser classes, service contracts, syntax contracts, and parser-library values are
deliberately absent from the root surface.

## Domain flow

1. A host adapter strictly decodes canonical bytes and supplies a source descriptor explicitly.
2. `IngestionSourceFactory` validates logical identity, path, and text invariants without changing
   content.
3. `SvgParser` converts library tokens immediately into an internal Aster-owned syntax model,
   while independently enforcing document shape, source spans, subset behaviour, and safety.
4. Parser and validator stages use `SourceLocator` to derive trustworthy positions from exact
   offsets.
5. Domain stages create Aster-owned reports through `SourceDiagnosticFactory`.
6. `SourceDiagnosticAggregator` deduplicates and orders independent reports deterministically.
7. `DiagnosticResultFactory` returns complete output with warnings or failure with blocking
   diagnostics and no partial output.

Filesystem discovery, terminal formatting, and process exit status stay outside this flow.

The accepted package decision is recorded by
[Private Build-time Domain Package](../../decisions/0002-private-build-time-domain-package.md). The
parser dependency and replacement boundary is recorded by
[Private XML Parser Boundary](../../decisions/0003-private-xml-parser-boundary.md).
