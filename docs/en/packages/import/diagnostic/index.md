# Import Diagnostics

`SourceDiagnostic` is stable Aster-owned evidence with code, severity, category, message, source
identity and optional exact spans or related context. `DiagnosticResultType<Value>` is a frozen
success-or-failure envelope: failure never carries a value and success never carries an error.

Public supporting contracts are `SourcePosition`, `SourceSpan` and `DiagnosticRelatedContext`.
Public types are `DiagnosticCodeType`, `DiagnosticCategoryType`, `DiagnosticSeverityType` and
`DiagnosticResultType<Value>`. Categories are limited to syntax, safety, technical and adoption;
severity is either error or warning.

`DiagnosticCodeType` is derived from the private immutable `diagnosticCodes` authority and accepts
only codes currently emitted by Import. The complete `diagnosticCodePolicy` assigns exactly one
category and severity to every code. Parser, validation and adoption producers therefore supply a
code and occurrence evidence without independently selecting observable authority. These
constants remain private because hosts consume diagnostic evidence but do not author Import
diagnostics.

Factories and aggregation remain private. A producer canonicalises and freezes each diagnostic
once; aggregation then deduplicates and orders those canonical values without rebuilding them.
Messages are stable single-line text, related contexts use canonical source order and equivalent
evidence produces byte-for-byte deterministic results.

Internal diagnostic composition uses two documented shapes:

- `TDiagnosticDetails` carries the stable code and message owned by one diagnostic family before
  occurrence-specific source evidence is added.
- `TSourceDiagnosticInput` carries occurrence-specific source evidence completed by the code
  policy during canonical construction.
- `TIndexedDiagnostic` retains a diagnostic with its original insertion index so deterministic
  aggregation can preserve stable order after canonical sorting.
