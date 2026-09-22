# CLI Release Notes

## 0.1.0-rc.1

Status: **Published on 22 September 2026**. This is the formal release candidate for the first
public `0.1.0`, not a previously supported release. No consumer migration is required.

Registry: [`@luscious-garden/aster-cli@0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-cli/v/0.1.0-rc.1)

Approved archive SHA-256: `39E5C9A172CEDE79EDC20A13F4127EB702C1A1F0471CC5C8B4328CF74248D364`.

**Compatible capability:** `@luscious-garden/aster-cli` exposes the host-neutral `AsterCommands` API and explicit
`AsterCatalogue` provider through its root, plus the standalone `aster` binary. The executable
supports `list`, `search`, `show`, `export`, `review`, `help`, and `version`. Catalogue discovery
uses Icons metadata and loads exact definitions only when an operation requires them. Runtime
dependencies are `@luscious-garden/aster-core@^0.1.0-rc.1`, `@luscious-garden/aster-icons@^0.1.0-rc.1`, and `@luscious-garden/aster-svg@^0.1.0-rc.1`.

**Accepted limits:** The executable requires Node `>=24.10.0 <25`. It has no plugin registration,
registry-backed `add`, watch mode, or external-source import command. Only the package root and
private binary are mapped; no implementation subpath is public. See [CLI](index.md),
[Compatibility](compatibility.md), and [Workflow](workflow.md) for supported behaviour.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
