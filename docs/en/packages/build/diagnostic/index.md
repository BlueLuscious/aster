# Build Diagnostic

Status: **Accepted**

The diagnostic feature provides stable Aster-owned evidence without exposing parser messages,
filesystem paths, stack traces, or host process authority.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `SourcePosition` | Carries a zero-based UTF-16 offset and one-based line and column. | Retained by `SourceSpan`. |
| `SourceSpan` | Carries an inclusive start and exclusive end position. | Optional primary and related diagnostic evidence. |
| `DiagnosticRelatedContext` | Explains another deterministic source location required by a relationship. | Retained as an optional ordered sequence by `SourceDiagnostic`. |
| `SourceDiagnostic` | Carries code, severity, category, message, logical source, optional span, and optional related context. | Created by `SourceDiagnosticFactory` and returned through `DiagnosticResultType`. |

## Types

| Type | Values or form | Responsibility |
| --- | --- | --- |
| `DiagnosticSeverityType` | `error`, `warning` | Distinguishes blocking failures from observable advice. |
| `DiagnosticCategoryType` | `syntax`, `safety`, `technical`, `metadata`, `collection`, `generation` | Assigns diagnostic meaning to a stable domain responsibility. |
| `DiagnosticCodeType` | `ASTER-<CATEGORY>-<NNN>` | Represents the Aster-owned diagnostic code family; runtime enforces category agreement and three digits. |
| `DiagnosticResultType<Value>` | Discriminated success or failure | Carries complete output with warnings, or blocking diagnostics with no partial value. Its envelope and diagnostics are frozen; the producing stage owns output immutability. |

The immutable `diagnosticCategories` and `diagnosticSeverities` objects are the runtime
authorities from which their public unions are derived.

## Internal types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `TDiagnosticDetails` | Carries the stable code, category, and message resolved for one internal diagnostic family. | Extended when an owning feature resolves additional observable metadata. |
| `TIndexedDiagnostic` | Associates one canonical diagnostic with its semantic encounter order. | Internal sorting value used by `SourceDiagnosticAggregator`. |

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `SourceDiagnosticFactory` | Validates code families, severity, category, stable message, logical source, span, and related context before deep freezing. | Composes source ID, span, and related-context factories. |
| `SourceDiagnosticAggregator` | Canonicalises, removes exact semantic duplicates, and orders diagnostics deterministically. | Uses `SourceDiagnosticFactory`; consumed by `DiagnosticResultFactory`. |
| `DiagnosticResultFactory` | Creates immutable success and failure values while enforcing their diagnostic authority. | Success rejects errors; failure requires at least one error. |
| `SourceSpanFactory` | Validates externally assembled positions and span ordering. | Internal authority used by diagnostic factories. |
| `DiagnosticRelatedContextFactory` | Validates and freezes related source evidence. | Internal authority used by `SourceDiagnosticFactory`. |
| `DiagnosticMessageNormaliser` | Produces trimmed non-empty single-line stable messages. | Shared by diagnostic and related-context factories. |

Invalid service input raises an internal deterministic programming error. Source failures are
represented as `SourceDiagnostic` values and returned to callers; no domain service calls
`process.exit()`, writes terminal output, or fabricates a source report for an unexpected
implementation failure.

## Canonical ordering

Diagnostics use this ascending order:

1. `sourceId` by Unicode code-unit order.
2. Start offset.
3. End offset.
4. Errors before warnings.
5. Category.
6. Code.
7. Stable semantic encounter index for an otherwise identical ordering key.

A missing span identifies the complete source and sorts with offset `-1` before located reports
for that source. Exact duplicates are retained once. Related context is ordered by `sourceId`,
start offset, end offset, and message.

Producer completion order and filesystem enumeration cannot affect diagnostics that differ by the
canonical keys. Callers provide a stable semantic encounter order only for reports whose accepted
keys are otherwise identical.

The repository-wide contract is
[Diagnostics and Determinism](../../../architecture/diagnostics-and-determinism.md).
