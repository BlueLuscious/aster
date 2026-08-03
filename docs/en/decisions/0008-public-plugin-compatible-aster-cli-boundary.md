# 0008: Public Plugin-compatible Aster CLI Boundary

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-08-03**

Affected documents:

- [Command-line Boundary](../architecture/command-line-boundary.md)
- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [Future Capabilities](../future-capabilities.md)

Supersedes: **None**

Superseded by: **None**

## Context

Aster has portable icon and collection definitions plus a deterministic SVG target, but users do
not have a product command surface for discovering installed catalogues. A future independent
headless CLI may host commands from Aster and other ecosystems. Binding Aster command logic to
Node argv, terminal output, process state, or an Aster-owned generic plugin framework would make
that integration costly and would mix product-domain queries with host effects.

The first commands need only explicit TypeScript-first catalogue data. They do not require the
optional SVG importer, filesystem mutation, package installation, or rendering.

## Decision drivers

- Provide a useful standalone `aster` executable.
- Reuse the same commands through an independent programmatic host.
- Keep catalogue discovery explicit and free from ambient mutable registries.
- Preserve Core, Icons, SVG, Build, framework, and external ecosystem independence.
- Keep Node and process authority in one thin shell.
- Avoid designing the generic ecosystem plugin ABI before its owner exists.
- Leave effectful command families absent until concrete workflows define narrow capabilities.

## Options

### Implement commands directly in a Node argument parser

This is initially small, but handlers would inherit argv, output, and process assumptions and
could not be mounted cleanly by another host.

### Build a generic multi-ecosystem plugin framework inside Aster

This would make plugin registration explicit, but Aster would own abstractions for unrelated
products without an independent consumer or compatibility authority.

### Expose a host-neutral command set with a thin standalone shell

This keeps Aster query semantics public and reusable while allowing the standalone executable and
future generic host to own their distinct effect boundaries.

## Decision

Create public `@aster/cli` with one root export and one `aster` executable.

The root exposes a frozen `AsterCommands` command set, a frozen explicit `AsterCatalogue`
provider, and the public contracts and discriminated types needed for programmatic execution.
Handlers receive explicit catalogue and product-metadata capabilities and return immutable,
serialisable results. They contain no Node, terminal, filesystem, network, package-manager,
renderer, Build, framework, or dynamic-loader authority.

The standalone shell alone adapts argv, registers the built-in provider, selects human or JSON
presentation, writes process streams, and maps exit status. A future generic host adapts the same
command set to its own registration ABI; Aster declares no generic plugin-loading contract.

The initial package depends directly on the public roots of `@aster/core` and `@aster/icons`.
Initial commands are `list`, `search`, `show`, help, and version. Effectful `add`, `export`,
`generate`, and `import` commands are deferred and grant no authority to the initial context.

## Consequences

### Positive

- Standalone and programmatic execution share one command implementation.
- Catalogue providers remain explicit, testable, and isolated from global process state.
- A future ecosystem host can mount Aster without depending on its Node shell.
- Initial discovery remains independent from SVG rendering and Build viability.
- Expected failures and machine output have deterministic Aster-owned representations.

### Negative

- The package contains both a portable command kernel and a Node-specific executable adapter.
- Public command contracts require compatibility care before the generic host exists.
- Human and machine presenters must remain separate from handler results.
- The CLI directly installs the built-in Icons catalogue unless a later packaging decision
  separates an independently useful command package.

### Deferred

- Extract a package such as `@aster/commands` only after an independent consumer demonstrates a
  separate installation or versioning need.
- Define a generic plugin registration ABI in the future ecosystem host, not in Aster.
- Add filesystem, renderer, package-manager, or Build capabilities only with accepted command
  workflows.
- Revisit the supported Node range through ordinary package runtime governance.

## Compatibility and migration

This is the first CLI boundary and affects no released consumer. Package conformance freezes root
exports, the binary entry, declarations, invocation and result discriminators, deterministic
output, and standalone versus programmatic equivalence before a compatibility-bearing release.

A later extraction of the host-neutral command set must preserve the `@aster/cli` root API or
provide an explicit migration. The generic host cannot become a dependency of Core, Icons, SVG,
Build, or adapters.

## Evidence

- [Command-line Boundary](../architecture/command-line-boundary.md)
- [CLI Compatibility and Conformance](../packages/cli/compatibility.md)
- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [Plugin-compatible Aster CLI](../future-capabilities.md#plugin-compatible-aster-cli)
