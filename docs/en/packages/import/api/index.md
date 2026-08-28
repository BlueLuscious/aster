# Import API

[`IconImport`](../index.md) is an immutable object implementing
`IconImportApi`. It exposes `inspect`, `define`, `emit`, `adopt` and `adoptMany`; each operation is
host-independent and deterministic.

## Operation rationale

| Operation | Independent responsibility |
| --- | --- |
| `inspect()` | Produces reviewable metadata-free geometry and source evidence before semantic metadata is accepted. |
| `define()` | Applies reviewed metadata to an accepted draft through Core without repeating source parsing. |
| `emit()` | Serialises an accepted or subsequently corrected definition without requiring its original source. |
| `adopt()` | Provides the atomic convenience composition for one source. |
| `adoptMany()` | Adds all-or-nothing collision detection and canonical ordering that repeated `adopt()` calls cannot provide. |

Removing any operation would either collapse review boundaries or force a host to duplicate Import
composition. The facade therefore remains the smallest coherent surface for both staged and
convenience workflows.

Expected source or metadata rejection returns `DiagnosticResultType<Value>`. Structurally malformed
API invocation throws `IconImportError`. Runtime classes remain private and no implementation
subpath is exported.

Accepted operations snapshot their result from caller-owned data. Enumerable data fields are read
without executing authored accessors, while failures deliberately raised by caller-controlled
`Proxy` traps preserve their original identity rather than being misreported as Import failures.

The facade owns one module-local `IconAdoptionService` and one immutable built-in adapter registry.
They retain no caller data, mutable registration or operation-specific state. Reusing that
composition avoids ceremonial construction while preserving deterministic independent results.
