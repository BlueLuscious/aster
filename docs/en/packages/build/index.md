# Private Build Domain

Status: **Accepted**

`@aster/build` owns reusable build-time domain services that transform canonical collection
sources into deterministic portable inputs and generation plans. It is a private workspace
package, not a published runtime dependency.

## Current boundary

The implemented boundary accepts exact textual source descriptors and produces stable
diagnostic-bearing results. It has no SVG parser, filesystem adapter, validator, normaliser,
generator, command-line adapter, or generated output authority yet.

## Features

| Feature | Responsibility |
| --- | --- |
| [Source](source/index.md) | Canonical textual source descriptors and exact UTF-16 locations. |
| [Diagnostic](diagnostic/index.md) | Stable diagnostics, deterministic aggregation, and success or failure results. |

## Dependency boundary

The package currently has no production dependency. Production compilation uses ES2022 without
Node, DOM, browser, Lilium, Lotus, or repository-tooling ambient types.

Future ingestion stages may depend on public `@aster/core` contracts and a replaceable parser
implementation when those dependencies own real behaviour. The package cannot depend on a
renderer, framework adapter, generated collection, host ecosystem, or repository tooling.

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
internal.

## Domain flow

1. A host adapter strictly decodes canonical bytes and supplies a source descriptor explicitly.
2. `IngestionSourceFactory` validates logical identity, path, and text invariants without changing
   content.
3. Parser and validator stages may use `SourceLocator` to derive trustworthy positions from exact
   offsets.
4. Domain stages create Aster-owned reports through `SourceDiagnosticFactory`.
5. `SourceDiagnosticAggregator` deduplicates and orders independent reports deterministically.
6. `DiagnosticResultFactory` returns complete output with warnings or failure with blocking
   diagnostics and no partial output.

Filesystem discovery, terminal formatting, and process exit status stay outside this flow.

The accepted package decision is recorded by
[Private Build-time Domain Package](../../decisions/0002-private-build-time-domain-package.md).
