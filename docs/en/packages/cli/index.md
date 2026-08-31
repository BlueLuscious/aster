# Aster CLI

Status: **Pre-release**

`@aster/cli` owns Aster's host-neutral command contracts, deterministic catalogue discovery, and
the standalone Node host. The implementation provides the frozen programmatic `AsterCommands`
composition, the explicit built-in `AsterCatalogue` provider, and the `aster` executable.

## Current boundary

The package root exposes public command, catalogue, and export contracts and types plus four frozen
values.
`AsterCommands` validates structured invocations and explicit contexts, dispatches `list`,
`search`, `show`, `export`, `help`, and `version`, and returns sanitised structured failures. It never
selects an ambient catalogue. Hosts pass providers explicitly in `AsterCommandContext`.

`AsterCatalogue` adapts the canonical `@aster/icons` definitions into that provider boundary. It
loads the icon package only when a catalogue command executes; importing `@aster/cli` or reading
help metadata does not eagerly evaluate the built-in catalogue.

## Features

| Feature | Responsibility |
| --- | --- |
| [API](api/index.md) | Composes the immutable host-neutral `AsterCommands` authority. |
| [Command](command/index.md) | Defines and executes host-neutral invocation, context, metadata, result, and diagnostic contracts. |
| [Command Invocation](command/invocation/index.md) | Accepts untrusted programmatic requests through explicit command-owned normalisers. |
| [Catalogue](catalogue/index.md) | Loads explicit providers and performs deterministic provider, collection, and icon discovery. |
| [Export](export/index.md) | Selects exact catalogue definitions and constructs immutable host-neutral SVG artefact plans. |
| [Shell](shell/index.md) | Adapts Node argv, presents human or JSON output, and commits documented process effects. |
| [Shell Parsing](shell/parsing/index.md) | Adapts standalone argv through explicit command-owned parsers. |
| [Shell Presentation](shell/presentation/index.md) | Produces deterministic human or JSON stream results. |
| [Shell Output](shell/output/index.md) | Publishes complete export trees through the private Node filesystem boundary. |

[CLI Workflow](workflow.md) describes how these features compose from one structured invocation
through immutable planning and optional standalone publication.

[CLI Compatibility and Conformance](compatibility.md) defines the package ABI, supported runtime,
programmatic-host guarantees, and release evidence across these features.

[CLI Quality](quality.md) records the hardened implementation, distribution, conformance, and
retained constraints without presenting deferred capabilities as accepted behaviour.
[CLI Quality Baseline](quality-baseline.md) defines reproducible execution, cold-start, allocation,
and distribution comparison evidence.

## Dependency boundary

The command and catalogue domains depend on the public root of `@aster/core`, which validates and
isolates portable icon and collection values. The built-in provider depends on `@aster/icons` and
adapts its independent `AsterIcons` and `AsterCollections` indexes without assigning catalogue
ownership to Core or one collection.

The export domain depends directly on the public `@aster/svg` root. It renders accepted portable
definitions without importing Import, filesystem services, or SVG implementation subpaths.

The host-neutral production compilation uses ES2022 ESM without Node or DOM ambient types. A
referenced shell project consumes its emitted declarations and admits Node types only beneath
`src/shell/`; it does not re-emit the host-neutral implementation. The shell acquires argv, writes
stdout or stderr, sets process exit status, and privately composes the narrow filesystem authority
required to publish complete export trees. It has no network, package-manager, Import, framework,
plugin-loader, or repository-tooling authority.

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
- `CatalogueResultKindType`;
- `AsterExportArtefact`, `AsterExportPlan`, `AsterExportSubjectType`, `AsterExportOptionsType`, and
  `AsterIconExportOptionsType`.

The root also exports the frozen `AsterCommands`, `AsterCatalogue`, `catalogueResultKinds`, and
`exportTargets` values. The package manifest maps the `aster` binary to its private built shell entrypoint. No
implementation subpath is public. [CLI Compatibility and Conformance](compatibility.md) owns the
accepted surface, runtime support and dependency guarantees.

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
- mixed search fields, cross-provider ambiguity, snapshot conflicts, and unavailable providers;
- exact export selection, option normalisation, deterministic SVG paths and contents, and complete
  immutable plans;
- exact shell render options, raw SVG redirection, and staged output-root publication.

Built-executable integration tests additionally verify human and JSON presentation, exact stream
selection, exit status, argument rejection, and silent public-root imports. Package conformance
also verifies exact exports and declarations, rejected subpaths, dependency direction, exclusive
Node process authority, private Node filesystem ownership, safe output-path mapping, atomic visible
publication, current-stage cleanup, equivalent complete export through standalone and independent
programmatic hosts, and byte-equivalent publication from a temporary consumer containing no
source files.

## Export boundary

Host-neutral SVG planning, raw and JSON presentation, shell render options, private output
publication, stable output diagnostics, and committed-destination feedback are implemented
without adding filesystem authority to `AsterCommands`. [CLI Export](export/index.md) owns
headless planning, while [CLI Shell Output](shell/output/index.md) owns filesystem commitment.
