# CLI Shell Output

Status: **Pre-release**

The output subfeature is the private Node filesystem boundary that publishes complete export trees
and self-contained static reviews. No filesystem contract, Node type, or output implementation is
exposed by the package root.

## Runtime composition

| Class | Responsibility |
| --- | --- |
| `ExportOutputPathResolver` | Resolves explicit output roots and rejects unsafe, ambiguous, escaping, or duplicate logical artefact paths. |
| `ExportOutputPublisher` | Stages a complete non-empty artefact tree beside an absent target and publishes it through one rename. |
| `OutputLocationResolver` | Resolves explicit output roots plus one deterministic same-parent stage root. |
| `ReviewOutputPathResolver` | Resolves the fixed static review document beneath shared safe output roots. |
| `ReviewOutputPublisher` | Serialises, stages, publishes, and explicitly replaces only unchanged Aster-owned reviews. |
| `NodeOutputFileSystem` | Implements the shared narrow private output authority with Node filesystem operations. |
| `OutputError` | Carries sanitised output-conflict or output-failure evidence for shell diagnostic adaptation. |

The private `IOutputFileSystem` contract limits publication to existence checks, directory
creation, UTF-8 text reads, exclusive text creation, directory rename, and owned-tree removal.
Resolved locations, staged entries, publication evidence, and error kinds remain internal output
types.

## Internal types

| Type | Responsibility |
| --- | --- |
| `TOutputLocation` | Carries the absolute target, deterministic sibling stage, and their shared parent. |
| `TExportOutputEntry` | Maps one validated logical artefact to its absolute staged destination and parent. |
| `TExportOutputPublication` | Reports target, artefact count, and whether a visible output tree was committed. |
| `TReviewOutputLocation` | Adds fixed target and staged `index.html` paths to one shared output location. |
| `TReviewOutputPublication` | Reports the committed review root and whether it replaced an owned review. |
| `TOutputErrorKind` | Derives the closed private output failure family from `outputErrorKinds`. |

These types remain private because absolute paths, staging and filesystem failure classification
belong only to the standalone Node host. The public command result retains logical artefacts and
stable Aster diagnostics instead.

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

## Review publication

Human review execution publishes one complete `index.html` to `aster-review` by default or to an
explicit `--output` root. The document is fully serialised before filesystem mutation. An absent
target follows the same parent preparation, exclusive stage creation, complete write, second
target check, and final rename pattern as Export.

An existing target is always rejected unless `--replace` is explicit. Replacement additionally
requires a readable `index.html` containing the exact Aster review ownership marker, an absent
private backup, and byte-identical ownership evidence immediately before commitment. The publisher
moves that target to its backup, renames the complete stage into place, and removes the backup. If
the stage-to-target rename fails, it restores the previous review and removes the failed stage.
Unowned, changed, interrupted, or ambiguous state is preserved and reported as a conflict.

Cleanup failure after the new target has been committed can leave a complete new target and its
complete old backup while reporting output failure. This explicit recovery evidence is preferable
to deleting either complete tree without authority. The host does not claim crash-atomic directory
exchange beyond native same-parent rename behaviour.

Publication is failure-safe only for operations observed by the current process. Exclusive stage
creation, a second target check, and same-parent rename narrow ordinary races but do not form an
operating-system transaction. The output host does not guarantee recovery after process or machine
failure, directory-entry durability, protection from hostile concurrent path or symlink mutation,
or removal of a stage left by an earlier run. A pre-existing target or stage is rejected and never
removed by the current attempt.
