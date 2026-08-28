# 0002: Private Build-time Domain Package

Status: **Superseded**

Owners: **Technical maintainers**

Date: **2026-07-28**

Affected documents:

- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [Replacement Import Domain](../packages/import/index.md)
- [SVG Processing Pipeline](../architecture/svg-processing-pipeline.md)

Supersedes: **None**

Superseded by: **[0011: Private External-source Adoption Compiler](0011-private-external-source-adoption-compiler.md)**

## Context

Aster needs reusable source acquisition, parsing, validation, normalisation, and generation
planning logic. These responsibilities are product-domain behaviour used by repository commands,
CI, and a possible future CLI, but they are not portable application runtime code.

Placing this logic directly in repository tooling would couple it to filesystem traversal,
terminal output, and process termination. Creating one package per pipeline stage before
independent consumers exist would establish premature versioning and dependency boundaries.

## Decision drivers

- Keep untrusted source and build-only dependencies out of public runtime packages.
- Reuse pure domain services from commands, CI, and future hosts.
- Preserve separate parser, validator, normaliser, and generator feature responsibilities.
- Avoid filesystem, process, and repository authority inside domain services.
- Avoid publishing or independently versioning unproven pipeline stages.

## Options

### Repository tooling implementation

Pipeline behaviour could live under `tooling/` beside command adapters. This would minimise the
initial package count but blur product validation with repository-only discovery and exit
behaviour.

### One private build-time package

A single private package can own all pipeline-domain features while keeping their contracts and
tests separate. Host adapters remain outside the package and communicate through explicit source
and result values.

### Separate parser, validator, normaliser, and generator packages

Each stage could have an independent workspace and distribution boundary. No current consumer,
release cadence, or dependency constraint justifies those packages.

## Decision

Aster uses the private workspace package `@aster/build` as its initial build-time product-domain
boundary.

The package:

- contains source, diagnostic, parser, validation, normalisation, and generation-planning features
  only as real behaviour is implemented;
- exposes one root workspace import and remains unpublished through `private: true`;
- compiles as host-independent ES2022 ESM;
- receives sources and configuration explicitly and returns Aster-owned results;
- never owns implicit filesystem traversal, terminal presentation, or process exit status;
- may depend on public portable Core contracts and replaceable build-only dependencies;
- cannot depend on renderers, framework adapters, generated collections, Lilium, Lotus, or
  repository tooling.

Parser, validator, normaliser, and generator remain features inside this package until evidence
proves an independent package boundary.

## Consequences

### Positive

- Build-domain behaviour remains reusable without becoming public runtime code.
- Repository commands adapt one explicit domain boundary rather than owning validation semantics.
- Pipeline stages preserve separate responsibilities without package proliferation.
- Parser replacement and future CLI hosting remain possible behind Aster-owned contracts.

### Negative

- Internal feature changes share one package version and build graph.
- The private root still requires disciplined exports because other workspace code can depend on
  it.
- A future public build API requires a separate compatibility and versioning review.

### Deferred

- Parser selection remains undecided until parsing conformance is evaluated.
- Metadata storage format remains undecided until metadata parsing begins.
- A public CLI or extracted pipeline package requires an independent consumer and superseding
  package-boundary evidence.

## Compatibility and migration

This package is private and changes no published Aster runtime or collection contract. Existing
repository tooling remains valid and does not become part of the package.

Extracting a stage, publishing the package, changing its host authority, or renaming the workspace
boundary requires a superseding decision record.

## Evidence

- [Replacement Import package](../../../packages/import/package.json)
- [Replacement decision](0011-private-external-source-adoption-compiler.md)
- [Architecture verification](../../../tooling/architecture/check-architecture.mjs)
- [Import package documentation](../packages/import/index.md)
