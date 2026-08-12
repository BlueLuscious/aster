# Workspace Tooling

Status: **Accepted**

The workspace feature owns guarded maintenance operations that require repository or package
filesystem authority. Product packages delegate these operations through scripts but never import
their implementation.

## Package output cleanup

The current cleaner accepts only a direct `dist` child beneath a directory containing
`package.json`. It:

- resolves package and output roots before deletion;
- rejects absent package identity;
- rejects traversal, the package root itself, nested paths, and output names other than `dist`;
- tolerates an already absent output;
- removes only the accepted generated boundary.

Each package invokes the cleaner from its own `clean` script, and the root `pnpm clean` command only
delegates. The root never discovers arbitrary deletion targets.

## Tests

Temporary package fixtures prove successful direct-output removal, absent-output idempotence, source
retention, and rejection of targets outside the guarded boundary.

## Internal hardening

The current module combines cleanup policy, filesystem execution, and command adaptation. Internal
hardening will separate those responsibilities while preserving containment and fixture behaviour.
No generic deletion API will be introduced.
