# CLI Shell Output

Status: **Pre-release**

The output subfeature is the private Node filesystem adapter that publishes one complete export
plan beneath an explicit destination. No filesystem contract, Node type, or output implementation
is exposed by the package root.

## Runtime composition

| Class | Responsibility |
| --- | --- |
| `ExportOutputPathResolver` | Resolves explicit output roots and rejects unsafe, ambiguous, escaping, or duplicate logical artefact paths. |
| `ExportOutputPublisher` | Stages a complete non-empty artefact tree beside an absent target and publishes it through one rename. |
| `NodeExportOutputFileSystem` | Implements the narrow private output authority with Node filesystem operations. |
| `ExportOutputError` | Carries sanitised output-conflict or output-failure evidence for shell diagnostic adaptation. |

The private `IExportOutputFileSystem` contract limits publication to existence checks, directory
creation, exclusive text creation, directory rename, and current-stage removal. Resolved
locations, staged entries, publication evidence, and error kinds remain internal output types.

## Publication guarantees

The supplied current directory must be absolute, preventing path resolution from consulting
ambient process state. An empty export plan resolves its requested location but performs no
filesystem operation. A non-empty plan rejects an existing target or deterministic sibling stage
before creating anything. The publisher creates the complete stage, checks the target again, and
commits through one same-parent rename.

A caught write or rename failure removes only a stage created by that publication attempt;
pre-existing and interrupted stages are preserved for explicit recovery. Absent parent
directories may be created before staging, so cleanup does not remove newly created empty
ancestors. Native filesystem messages are never retained by the stable failure surface.

Logical artefact paths use forward slashes and portable segments. Empty segments, traversal,
absolute paths, backslashes, control characters, cross-platform-invalid characters, trailing dots
or spaces, Windows device names, destination escape, and exact duplicate destinations are rejected
before filesystem mutation. Generated Aster paths use canonical lowercase ASCII identities, so
platform case folding and Unicode normalisation cannot alias accepted generated entries.

Publication is failure-safe only for operations observed by the current process. Exclusive stage
creation, a second target check, and same-parent rename narrow ordinary races but do not form an
operating-system transaction. The output host does not guarantee recovery after process or machine
failure, directory-entry durability, protection from hostile concurrent path or symlink mutation,
or removal of a stage left by an earlier run. A pre-existing target or stage is rejected and never
removed by the current attempt.
