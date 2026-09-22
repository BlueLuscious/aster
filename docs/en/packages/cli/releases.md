# CLI Release Notes

## 0.1.0 candidate

Status: **Not published**. This is the proposed first public version, not a previously supported
release. No consumer migration is required.

**Compatible capability:** `@aster/cli` exposes the host-neutral `AsterCommands` API and explicit
`AsterCatalogue` provider through its root, plus the standalone `aster` binary. The executable
supports `list`, `search`, `show`, `export`, `review`, `help`, and `version`. Catalogue discovery
uses Icons metadata and loads exact definitions only when an operation requires them. Runtime
dependencies are `@aster/core@^0.1.0`, `@aster/icons@^0.1.0`, and `@aster/svg@^0.1.0`.

**Accepted limits:** The executable requires Node `>=24.10.0 <25`. It has no plugin registration,
registry-backed `add`, watch mode, or external-source import command. Only the package root and
private binary are mapped; no implementation subpath is public. See [CLI](index.md),
[Compatibility](compatibility.md), and [Workflow](workflow.md) for supported behaviour.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
