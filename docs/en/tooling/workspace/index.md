# Workspace Tooling

Status: **Accepted**

The workspace feature owns guarded maintenance operations that require repository or package
filesystem authority. Product packages delegate these operations through scripts but never import
their implementation.

## Package output cleanup

The cleaner is an explicit composition of four responsibilities:

| Responsibility | Authority |
| --- | --- |
| Package identity | `PackageRootInspector` accepts only a directory with a direct `package.json` file. |
| Output policy | `PackageOutputCleanupPolicy` resolves and accepts only the direct `dist` child. |
| Filesystem execution | `NodePackageOutputFileSystem` supplies file inspection and idempotent recursive removal. |
| Coordination | `PackageOutputCleaner` verifies package identity and policy before invoking deletion. |

`PackageOutputCleanupCommand` is the separate process adapter. It reads the requested output from
the command line, supplies the current package root, emits diagnostics, and maps failure to the
process exit state. It does not decide which path may be deleted.

The composition:

- resolves package and output roots before deletion;
- rejects absent package identity;
- rejects traversal, the package root itself, nested paths, and output names other than `dist`;
- tolerates an already absent output;
- removes only the accepted generated boundary.

Each package invokes the cleaner from its own `clean` script, and the root `pnpm clean` command only
delegates. The root never discovers arbitrary deletion targets.

## Tests

Temporary package fixtures prove successful direct-output removal, absent-output idempotence, source
retention, and rejection of targets outside the guarded boundary. Capability-level tests also prove
that package inspection and policy acceptance occur before destructive execution.

The cleaner exposes no generic deletion operation. Filesystem removal remains behind the narrow
internal cleanup capability, and accepted policy vocabulary remains owned by this feature.

## Package scripts

Each package invokes the stable cleanup entrypoint from its own `clean` script. The entrypoint
composes runtime authorities and retains a programmatic cleanup function for tooling conformance;
published packages do not import either surface.
