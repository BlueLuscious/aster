# Aster CLI

Status: **Experimental**

`@aster/cli` owns Aster's host-neutral command contracts, deterministic catalogue discovery, and
their future standalone Node host. The current implementation provides the frozen programmatic
`AsterCommands` composition and the explicit built-in `AsterCatalogue` provider. The `aster`
executable is not implemented yet.

## Current boundary

The package root exposes public command and catalogue contracts, types, and two frozen values.
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

## Dependency boundary

The command and catalogue domains depend on the public root of `@aster/core`, which validates and
isolates portable icon and collection values. The built-in provider depends on `@aster/icons` and
adapts `AsterCollection` without assigning catalogue ownership to Core.

Production compilation uses ES2022 ESM without Node or DOM ambient types. The source has no argv,
process, terminal, filesystem, network, renderer, package-manager, Build, framework, or
repository-tooling authority.

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
- `CatalogueProviderResult`, `CatalogueIconResult`, and `CatalogueCollectionResult`.

The root also exports the frozen `AsterCommands` and `AsterCatalogue` values. No executable or
implementation subpath is currently public. The accepted surface and dependency direction remain
defined by the [Command-line Boundary](../../architecture/command-line-boundary.md).

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

Published-package ABI and executable conformance remain pending final package verification.
