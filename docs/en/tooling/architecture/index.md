# Architecture Tooling

Status: **Accepted**

The architecture feature verifies repository-owned structural policy through the stable
`pnpm check:architecture` command. It reports every deterministic finding for one explicitly
supplied workspace root rather than terminating on the first issue.

## Current verification

The verifier inspects:

- the shared ES2022 host-independent compiler baseline;
- pnpm and ecosystem workspace-pattern equivalence;
- exact package identity, manifests, dependencies, and package-root boundaries;
- Core dependency freedom and public package restrictions;
- Build privacy, parser dependency, and host separation;
- CLI dependency, executable, and Node-authority restrictions;
- cross-package relative imports and production dependency cycles;
- authored collection root requirements and forbidden generated structures.

The exported `verifyArchitecture(workspaceRoot)` function returns an ordered issue array and owns no
terminal or process state. Its command adapter resolves the repository root, prints the result, and
sets failure exit state.

## Tests

Fixture tests create independent temporary workspaces and verify accepted and rejected compiler,
dependency, package, parser, validation-layer, and collection structures. The verifier does not
need a built package or network access.

## Internal hardening

The current implementation contains acquisition, graph, package, compiler, and collection policy
in one module. Internal hardening separates those responsibilities into runtime and policy objects
without changing the root command or fixture outcomes. Shared filesystem capabilities are accepted
only when another tooling feature uses the same semantics.
