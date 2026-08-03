# Aster CLI

Status: **Experimental**

`@aster/cli` owns Aster's host-neutral command contracts and their future standalone Node host.
The current implementation provides the immutable command kernel foundation; catalogue discovery,
the frozen public command composition, and the `aster` executable are not implemented yet.

## Current boundary

The package root currently exposes public command and catalogue contracts and types. Its internal
kernel validates structured invocations and explicit contexts, orders help metadata, dispatches
explicit definitions, and returns sanitised structured failures without acquiring process effects.

No partial `AsterCommands` facade or placeholder catalogue handler is public. That accepted value
surface will be introduced only when the real catalogue definitions can form a complete command
composition.

## Features

| Feature | Responsibility |
| --- | --- |
| [Command](command/index.md) | Defines host-neutral invocation, context, metadata, result, and execution contracts. |
| [Catalogue](catalogue/index.md) | Defines explicit provider and immutable snapshot records consumed by later discovery commands. |

## Dependency boundary

The current kernel depends only on the public root of `@aster/core`, which supplies portable icon,
collection, and identity contracts for catalogue records. The built-in provider will add the
accepted `@aster/icons` dependency when it is implemented.

Production compilation uses ES2022 ESM without Node or DOM ambient types. The current source has no
argv, process, terminal, filesystem, network, renderer, package-manager, Build, framework, or
repository-tooling authority.

## Current package surface

The package exposes only its root `"."`. It currently exports these types:

- `AsterCommandSet`, `AsterCommandDescriptor`, and `AsterCommandContext`;
- `AsterCommandNameType`, `AsterCommandListSubjectType`, `AsterCommandShowSubjectType`,
  `AsterCommandInvocationType`, and `AsterCommandResultType`;
- `AsterCommandDiagnosticType`, `AsterCommandDiagnosticCodeType`, and
  `AsterCommandDiagnosticCategoryType`;
- `CatalogueProvider`, `CatalogueSnapshot`, `CatalogueIconRecord`, and
  `CatalogueCollectionRecord`.

No runtime value, executable, or implementation subpath is currently public. The complete accepted
surface and dependency direction remain defined by the
[Command-line Boundary](../../architecture/command-line-boundary.md).

## Current verification

Compile-time tests verify the public structured invocation and result families, exact optional
properties, and absence of DOM ambient types. Runtime tests verify:

- descriptor isolation, deep freezing, and canonical order;
- equivalent results for equivalent normalised invocations;
- rejection of unknown commands, missing values, duplicate tag options, invalid identities, and
  unknown fields;
- explicit context validation and duplicate-provider conflicts;
- execution through an independent programmatic host;
- sanitisation of unexpected definition exceptions.

Package ABI and executable conformance remain pending until those surfaces exist.
