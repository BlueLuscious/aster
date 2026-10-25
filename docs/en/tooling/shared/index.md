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

`RepositoryJsonReader` gives every parsed object a null prototype, including nested records.
Arrays retain their ordinary prototype, and JSON-owned keys such as `__proto__` remain data.
The reader does not freeze values or validate feature-specific schemas; each consumer owns that
validation. Its object representation prevents absent manifest/configuration fields from resolving
through the host prototype.

Filesystem-facing classes depend on the internal `IRepositoryFileSystem` capability rather than
reading process state. It exposes existence, immediate entries, UTF-8 text acquisition, and file
size without deletion or writing. Entry records use the internal `IRepositoryDirectoryEntry`
shape, composed from one name and one `TRepositoryEntryKind`, so shared runtime classes do not
depend on Node directory-entry objects.

## Boundaries

`RepositoryPathResolver.contains()` delegates lexical normalisation to Node's relative-path
operation, then rejects parent escapes and absolute cross-volume relations. It does not use raw
string prefixes, retain resolved paths between calls, test existence or resolve symbolic links.
Filesystem ownership and link checks remain the responsibility of the capability performing an
effect; lexical containment alone is not a filesystem sandbox.

Shared tooling does not expose deletion, writing, terminal output, process exit state, package
policy, Markdown policy, or benchmark scenarios. Destructive cleanup remains owned by
[Workspace Tooling](../workspace/index.md), while every verifier and baseline retains its own
domain policy.

The feature is private repository infrastructure. Published packages cannot import it and its
contracts do not form part of an Aster package ABI.

## Tests

Tests verify lexical path containment against the native resolved-path expression, sibling/parent
rejection, relative and empty inputs, current-directory changes, Windows volumes/UNC/device paths,
POSIX distinctions and native invalid-argument errors. They also cover deterministic traversal,
absent optional roots, strict JSON acquisition and malformed input.
Feature fixtures verify the command behaviour built on these capabilities.
