# Import Diagnostics

Diagnostics report source or adoption rejection without exposing parser-native errors.
`DiagnosticResultType<Value>` is a success/failure union with a frozen envelope and diagnostic
sequence. The producing operation owns its value's immutability: success carries a value and
may carry warnings; failure carries no value. Malformed invocation uses
[Import Errors](../error/index.md) instead.

## Contracts and types

| Symbol | Responsibility and relations |
| --- | --- |
| `SourceDiagnostic` | Stable code, severity, category, message and logical source identity, with optional `SourceSpan` and related contexts. |
| `SourcePosition` | Zero-based UTF-16 offset plus one-based line and UTF-16 column in exact source text. |
| `SourceSpan` | Inclusive start and exclusive end `SourcePosition` values. |
| `DiagnosticRelatedContext` | Related logical source, explanatory message and optional exact span. |
| `DiagnosticCodeType` | Closed codes derived from private `diagnosticCodes`; producers cannot invent observable codes. |
| `DiagnosticCategoryType` | Closed syntax, safety, technical and adoption responsibility family. |
| `DiagnosticSeverityType` | Blocking `error` or advisory `warning`. |
| `DiagnosticResultType<Value>` | Operation result union associating an accepted value or rejection with ordered diagnostics. |

LF and CRLF each count as one line break. Offsets refer to the caller's unnormalised text.
[Source location](../formats/svg/parser/index.md#source-evidence) owns parser evidence; a diagnostic
has a span only when the producer has a trustworthy locus.

## Canonical construction

Private `diagnosticCodePolicy` assigns exactly one category and severity to each code. Factories
complete occurrence evidence from that authority rather than letting producers select policies.
Single-line messages and canonical related-source ordering make equivalent evidence deterministic.

Each producer constructs and freezes a diagnostic once. Aggregation deduplicates and orders those
values without rebuilding them. Private supporting types are:

| Type | Responsibility and relations |
| --- | --- |
| `TDiagnosticDetails` | Stable family-owned code/message before occurrence evidence. |
| `TSourceDiagnosticInput` | Occurrence evidence completed by code policy during construction. |
| `TIndexedDiagnostic` | Diagnostic plus insertion index, preserving stable order after canonical sorting. |
