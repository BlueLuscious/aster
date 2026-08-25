# Aster CLI

Status: **Experimental**

`@aster/cli` owns Aster's host-neutral command contracts, deterministic catalogue discovery, and
the standalone Node host. The implementation provides the frozen programmatic `AsterCommands`
composition, the explicit built-in `AsterCatalogue` provider, and the `aster` executable.

## Current boundary

The package root exposes public command and catalogue contracts, types, and three frozen values.
`AsterCommands` validates structured invocations and explicit contexts, dispatches `list`,
`search`, `show`, `help`, and `version`, and returns sanitised structured failures. It never
selects an ambient catalogue. Hosts pass providers explicitly in `AsterCommandContext`.

`AsterCatalogue` adapts the canonical `@aster/icons` definitions into that provider boundary. It
loads the icon package only when a catalogue command executes; importing `@aster/cli` or reading
help metadata does not eagerly evaluate the built-in catalogue.

## Features

| Feature | Responsibility |
| --- | --- |
| [Command](command/index.md) | Defines and executes host-neutral invocation, context, metadata, result, and diagnostic contracts. |
| [Catalogue](catalogue/index.md) | Loads explicit providers and performs deterministic provider, collection, and icon discovery. |
| [Shell](shell/index.md) | Adapts Node argv, presents human or JSON output, and commits documented process effects. |

[CLI Compatibility and Conformance](compatibility.md) defines the package ABI, supported runtime,
programmatic-host guarantees, and release evidence across these features.

## Dependency boundary

The command and catalogue domains depend on the public root of `@aster/core`, which validates and
isolates portable icon and collection values. The built-in provider depends on `@aster/icons` and
adapts `AsterCollection` without assigning catalogue ownership to Core.

The host-neutral production compilation uses ES2022 ESM without Node or DOM ambient types. A
referenced shell project consumes its emitted declarations and admits Node types only beneath
`src/shell/`; it does not re-emit the host-neutral implementation. The initial shell acquires
argv, writes stdout or stderr, and sets process exit status; it has no filesystem mutation,
network, package-manager, renderer, Build, framework, plugin-loader, or repository-tooling
authority.

## Current package surface

The package exposes only its root `"."`. It exports these types:

- `AsterCommandSet`, `AsterCommandDescriptor`, and `AsterCommandContext`;
- `AsterCommandNameType`, `AsterCommandListSubjectType`, `AsterCommandShowSubjectType`,
  `AsterCommandInvocationType`, `AsterCommandPayloadKindType`, `AsterCommandPayloadType`, and
  `AsterCommandResultType`;
- `AsterCommandDiagnosticType`, `AsterCommandDiagnosticCodeType`, and
  `AsterCommandDiagnosticCategoryType`;
- `CatalogueProvider`, `CatalogueSnapshot`, `CatalogueIconRecord`, and
  `CatalogueCollectionRecord`;
- `CatalogueProviderResult`, `CatalogueIconResult`, and `CatalogueCollectionResult`;
- `CatalogueResultKindType`.

The root also exports the frozen `AsterCommands`, `AsterCatalogue`, and `catalogueResultKinds`
values. The package manifest maps the `aster` binary to its private built shell entrypoint. No
implementation subpath is public. The accepted surface and dependency direction are defined by the
[Command-line Boundary](../../architecture/command-line-boundary.md).

## Current verification

Compile-time tests verify the public structured invocation, payload, result, and catalogue-result
families, exact optional properties, and absence of DOM ambient types. Runtime tests verify:

- descriptor isolation, deep freezing, and canonical order;
- equivalent results for equivalent normalised invocations;
- rejection of unknown commands, missing values, duplicate tag options, invalid identities, and
  unknown fields;
- explicit context validation and duplicate-provider conflicts;
- execution through an independent programmatic host;
- sanitisation of unexpected definition and provider exceptions;
- explicit built-in discovery and lazy provider loading;
- empty and standalone catalogue values, canonical ordering, and exact filters;
- many-to-many membership without duplicated icon identity;
- mixed search fields, cross-provider ambiguity, snapshot conflicts, and unavailable providers.

Built-executable integration tests additionally verify human and JSON presentation, exact stream
selection, exit status, argument rejection, and silent public-root imports. Package conformance
also verifies exact exports and declarations, rejected subpaths, dependency direction, exclusive
Node process authority, and execution from a temporary consumer containing no source files.

## Accepted next boundary

SVG export is architecturally accepted but not yet implemented or part of the current package ABI.
It will add exact icon and collection selection, complete immutable SVG artefact plans, raw
single-icon output, and an optional private Node output host without adding filesystem authority to
`AsterCommands`. The canonical future contract is defined by the
[Command-line Boundary](../../architecture/command-line-boundary.md#accepted-export-extension).
