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

## Composition

`ArchitectureVerifierFactory` composes one fresh verifier from repository capabilities and
feature-owned policies. `ArchitectureVerifier` then invokes these inspectors in stable order:

1. `WorkspaceArchitectureInspector` acquires the root compiler and workspace authorities.
2. `PackageArchitectureInspector` acquires package records, validates declarations, delegates
   recognised package policies, inspects source modules, and completes the dependency graph.
3. `CollectionArchitectureInspector` verifies authored collection identities and directory
   boundaries.

`ArchitectureIssueCollector` receives every finding without throwing on policy failure and returns
an immutable ordered snapshot. Acquisition failures such as unreadable or malformed repository
authorities remain operational failures rather than architecture findings.

## Package inspection

Package discovery produces an internal `TWorkspacePackageRecord` containing directory, canonical
name, parsed manifest, and absolute package root. `RuntimeDependencyReader` combines only the
accepted production dependency fields, while `WorkspaceDependencyGraph` owns dependency edges and
cycle traversal.

Recognised packages implement the internal `IPackageArchitecturePolicy` contract:

| Policy | Responsibility |
| --- | --- |
| `CorePackagePolicy` | Enforces dependency freedom, ecosystem independence, root export shape, and portable compiler options. |
| `BuildPackagePolicy` | Enforces privacy, accepted dependencies, parser pinning, root export shape, and portable compiler options. |
| `CliPackagePolicy` | Enforces public visibility, accepted dependencies, root export shape, and portable compiler options. |

`RootPackageExportPolicy` and `PortableCompilerPolicy` hold rules genuinely shared by those package
policies. Unrecognised workspace packages still participate in manifest acquisition, ESM checks,
module inspection, and dependency-cycle detection without receiving invented package-specific
policy.

## Module inspection

`PackageModuleInspector` walks source modules and delegates lexical extraction to
`ModuleSpecifierExtractor`. It verifies relative package escapes, Build private-feature exposure,
Build and CLI Node authority, Build layer direction, parser adapter ownership, and undeclared
workspace imports. It does not resolve modules through Node or execute source code.

## Authorities

Closed architecture vocabulary is owned by immutable feature constants:

| Authority | Responsibility |
| --- | --- |
| `compilerBaseline` | Exact host-independent root compiler options. |
| `collectionBoundaries` | Required authored roots, forbidden generated roots, and collection slug grammar. |
| `packageBoundaries` | Package identities, dependency allowlists, root exports, parser ownership, and private Build feature roots. |
| `repositoryArchitecturePaths` | Repository roots and package-relative paths interpreted by architecture policy. |
| `sourceModule` | Source extensions, ecosystem package grammar, and static module-specifier grammar. |

These authorities are private repository policy. They are not package contracts and cannot be
imported by production code.

## Tests

Fixture tests create independent temporary workspaces and verify accepted and rejected compiler,
dependency, package, parser, validation-layer, and collection structures. The verifier does not
need a built package or network access. Focused tests verify module extraction, graph ordering, and
inspector orchestration through an explicit root. Integration fixtures preserve accepted and
rejected compiler, package, module, dependency, and collection outcomes.

Filesystem acquisition, path handling, strict JSON reading, directory discovery, and deterministic
source traversal come from [Shared Tooling](../shared/index.md); architecture-specific policy never
enters that shared boundary.
