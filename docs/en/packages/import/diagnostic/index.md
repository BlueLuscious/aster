# Import Diagnostics

`SourceDiagnostic` is stable Aster-owned evidence with code, severity, category, message, source
identity and optional exact spans or related context. `DiagnosticResultType<Value>` is a frozen
success-or-failure envelope: failure never carries a value and success never carries an error.

Public supporting contracts are `SourcePosition`, `SourceSpan` and `DiagnosticRelatedContext`.
Public types are `DiagnosticCodeType`, `DiagnosticCategoryType`, `DiagnosticSeverityType` and
`DiagnosticResultType<Value>`. Categories are limited to syntax, safety, technical and adoption;
severity is either error or warning.

Factories and aggregation remain private. They canonicalise, deduplicate and order diagnostics
without exposing parser-library errors or environment-specific text.

Internal diagnostic composition uses two documented shapes:

- `TDiagnosticDetails` carries the stable code, category and message owned by one diagnostic
  family before occurrence-specific source evidence is added.
- `TIndexedDiagnostic` retains a diagnostic with its original insertion index so deterministic
  aggregation can preserve stable order after canonical sorting.
