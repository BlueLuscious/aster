# Import API

[`IconImport`](../index.md) is an immutable object implementing
`IconImportApi`. It exposes `inspect`, `define`, `emit`, `adopt` and `adoptMany`; each operation is
host-independent and deterministic.

Expected source or metadata rejection returns `DiagnosticResultType<Value>`. Structurally malformed
API invocation throws `IconImportError`. Runtime classes remain private and no implementation
subpath is exported.
