# Shared Tooling

Status: **Accepted**

The shared tooling feature contains private repository capabilities with at least two retained
consumers. It owns no architecture, documentation, cleanup, benchmark, process, or presentation
policy.

## Capabilities

`repositoryEntryKinds` is the immutable runtime authority for the `directory`, `file`, and `other`
entry classifications. The internal `TRepositoryEntryKind` type derives that exact closed
vocabulary.

| Class | Responsibility | Current consumers |
| --- | --- | --- |
| `NodeRepositoryFileSystem` | Adapts Node text, directory, existence, and file-size acquisition to a narrow inspection contract. | Architecture, Documentation, Performance. |
| `RepositoryPathResolver` | Resolves, relates, contains, and presents repository paths. | Architecture, Documentation, Performance, Workspace. |
| `RepositoryJsonReader` | Parses strict JSON objects through injected text acquisition. | Architecture, Performance. |
| `RepositoryDirectoryReader` | Reads sorted immediate directory membership from optional roots. | Architecture, Documentation. |
| `RepositoryFileWalker` | Traverses optional directory trees deterministically with caller-owned file selection. | Architecture, Documentation, Performance. |

Filesystem-facing classes depend on the internal `IRepositoryFileSystem` capability rather than
reading process state. It exposes existence, immediate entries, UTF-8 text acquisition, and file
size without deletion or writing. Entry records use the internal `IRepositoryDirectoryEntry`
shape, composed from one name and one `TRepositoryEntryKind`, so shared runtime classes do not
depend on Node directory-entry objects.

## Boundaries

Shared tooling does not expose deletion, writing, terminal output, process exit state, package
policy, Markdown policy, or benchmark scenarios. Destructive cleanup remains owned by
[Workspace Tooling](../workspace/index.md), while every verifier and baseline retains its own
domain policy.

The feature is private repository infrastructure. Published packages cannot import it and its
contracts do not form part of an Aster package ABI.

## Tests

Foundation tests verify path containment, sibling and parent rejection, deterministic directory
and file ordering, absent optional roots, strict JSON acquisition, and malformed input. Existing
feature fixtures continue to verify observable command behaviour after adopting these shared
capabilities.
