# Command-line Boundary

Status: **Accepted**

This document defines the public Aster command set, catalogue discovery contract, standalone Node
shell, deterministic query semantics, and future plugin-host compatibility.

## Product boundary

`@aster/cli` will provide two compositions from one package:

- a host-neutral Aster command set available through the package root;
- a thin Node executable named `aster`.

The command set owns command identity, validation, catalogue queries, deterministic ordering, and
structured results. It does not own argv, environment variables, stdout, stderr, terminal state,
process exit state, filesystem access, network access, package installation, or dynamic module
loading.

The Node shell adapts argv to structured invocations, supplies explicit capabilities, presents
results, and maps failures to process output and exit status. A future independent ecosystem host
can mount the same command set without importing or emulating the standalone shell.

The first implementation targets the repository Node range, currently `>=24.10.0 <25`, uses the
`aster` binary name, and publishes native ESM only.

## Dependency direction

The initial package depends on the public roots of `@aster/core` and `@aster/icons`:

```text
@aster/cli ------> @aster/icons ------> @aster/core
       +------------------------------> @aster/core
```

It does not depend on `@aster/svg`, `@aster/build`, a framework, a renderer, repository tooling,
or a generic plugin framework. Core, Icons, SVG, Build, adapters, and consumers never depend on
the CLI.

The direct Core dependency allows public catalogue records to retain portable icon and collection
contracts without relying on transitive dependency resolution. The Icons dependency supplies the
explicit built-in Aster catalogue; it does not establish a global catalogue.

## Public package surface

The initial package exposes only its root `"."` and the `aster` executable. Implementation
subpaths, the Node shell, presenters, parsers, and built-in provider internals are not public.

The root surface contains these public responsibilities:

| Symbol | Kind | Responsibility |
| --- | --- | --- |
| `AsterCommands` | Frozen command-set object | Describes and executes the Aster command family through explicit context. |
| `AsterCatalogue` | Frozen catalogue provider | Supplies the built-in Aster icons and collection as an explicit provider. |
| `AsterCommandSet` | Interface | Declares command-set identity, immutable descriptors, and asynchronous execution. |
| `AsterCommandDescriptor` | Interface | Describes one stable command and its usage without a terminal representation. |
| `AsterCommandContext` | Interface | Supplies the complete capability set for one execution. |
| `CatalogueProvider` | Interface | Loads one identified immutable catalogue snapshot. |
| `CatalogueSnapshot` | Interface | Contains provider-owned icon and collection records. |
| `CatalogueIconRecord` | Interface | Associates one portable icon with catalogue provenance and independent collection memberships. |
| `CatalogueCollectionRecord` | Interface | Associates one portable collection with catalogue provenance. |
| `AsterCommandInvocationType` | Type | Represents the closed structured invocation union. |
| `AsterCommandResultType` | Type | Represents serialisable success and failure results. |
| `AsterCommandDiagnosticType` | Type | Represents stable expected command failures. |

Minor supporting public types may be introduced only when these contracts cannot express their
closed discriminators without duplication. No generic plugin registration ABI is declared by
Aster before an independent host owns that ABI.

## Command-set compatibility

`AsterCommands` has the stable command-set identity `aster`. Its descriptors and execution method
form the complete integration point for both the standalone shell and a programmatic host.

A host mounts or namespaces that command set according to its own policy. Aster does not call a
host registration API and does not inspect global registries. This permits a future generic host
to adapt Aster alongside other ecosystems without making either product depend on the other's
implementation.

Command execution is asynchronous so a provider can honour an effect boundary without changing
the command ABI. The accepted built-in provider remains static and performs no network or
filesystem work.

## Explicit capabilities

One `AsterCommandContext` contains only:

- an ordered immutable sequence of catalogue providers;
- explicit product name and version values needed by metadata commands.

There are no default ambient providers. The standalone shell passes `AsterCatalogue` explicitly.
A programmatic host may pass the same provider, additional providers, or an empty sequence.

Handlers receive no output writer, terminal, logger, process, clock, filesystem, network, package
manager, renderer, Build service, or dynamic loader. Deferred effectful commands must introduce
narrow capabilities when their real workflows are accepted rather than widening this foundation.

## Catalogue providers and snapshots

Every provider has a canonical ASCII lowercase kebab-case identity and loads one immutable
snapshot. The built-in provider identity is `aster`.

A snapshot contains icon and collection records. Records retain their portable definitions but
keep catalogue provenance, search indexes, aliases, and memberships outside Core values. An icon
can belong to zero, one, or many collections; a collection independently retains zero or more
icons.

Provider and snapshot validation follows these rules:

- duplicate provider identities in one context are a conflict;
- duplicate icon or collection identities within one provider are a conflict;
- equal portable identities from different providers are allowed and retain provider provenance;
- exact lookup across providers fails as ambiguous unless a provider filter leaves one result;
- a provider rejection or exception becomes a sanitised provider failure without native exception
  text;
- provider registration order never determines a selected record.

Providers are loaded at most once per command execution. A command does not retain snapshots or
mutate providers after returning.

## Canonical textual identities

CLI identities preserve the independent Core identity model:

| Subject | Syntax | Example |
| --- | --- | --- |
| Provider | `<provider>` | `aster` |
| Collection | `[<namespace>/]<name>` | `aster` |
| Icon | `[<namespace>/]<name>[@<variant>]` | `aster/camera` |

Every component uses its existing canonical kebab-case domain. `/` separates an optional
namespace and `@` separates an optional icon variant, avoiding ambiguity between namespace and
variant. Catalogue provider identity is selected separately and never becomes part of a portable
icon or collection identity.

## Initial grammar

The standalone shell accepts these workflows:

```text
aster list catalogues
aster list collections [--catalogue <provider>]
aster list icons [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...
aster search <query> [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...
aster show icon <identity> [--catalogue <provider>]
aster show collection <identity> [--catalogue <provider>]
aster help [list|search|show]
aster version
```

`--json` is a shell presentation option accepted once for any command. It does not enter the
host-neutral invocation because programmatic callers already receive structured results.

Unknown commands, subjects, options, repeated singleton options, missing option values, and extra
positional values are usage failures. Filters use exact canonical identities. An unknown provider
or collection filter is a not-found failure rather than an empty successful query.

`list` succeeds with an empty sequence when its valid scope contains no records. `search` trims
and lowercases its non-empty query, matches canonical identity, display name, intrinsic tags, and
provider-supplied search terms, and succeeds with an empty sequence when nothing matches. All
query terms must match somewhere on one record. `show` requires one exact result and otherwise
returns not-found or ambiguity.

## Deterministic ordering

Results never depend on provider registration order, collection membership order, locale, or
object insertion order. Canonical ASCII values are compared lexically by code unit.

Ordering keys are:

1. provider identity;
2. canonical portable identity;
3. stable record kind where a mixed result requires a final tie-breaker.

Search does not introduce environment-sensitive relevance scoring. Matching records use the same
canonical ordering as list results.

## Results, diagnostics, and presentation

Handlers return deeply immutable, JSON-serialisable discriminated results. Success results contain
one command-specific payload. Expected failures contain a stable category, code, concise message,
and optional serialisable related values.

The initial failure categories are:

| Category | Responsibility |
| --- | --- |
| `usage` | Invalid command structure or option value. |
| `not-found` | An explicitly requested provider, collection, or exact subject does not exist. |
| `ambiguous` | Exact identity lookup resolves to multiple providers. |
| `catalogue-conflict` | Provider or snapshot identities violate uniqueness. |
| `catalogue-unavailable` | A provider cannot supply a valid snapshot. |
| `execution-failure` | An unexpected command-definition fault was sanitised by the kernel. |

Expected command failures do not throw. Unexpected implementation faults may be caught at the
shell boundary, but their native text is never exposed as a stable diagnostic.

Human presentation is plain deterministic text without mandatory ANSI styling or terminal-width
logic. Human successes go to stdout and human failures go to stderr. Exit status is `0` for
success, `2` for usage failure, and `1` for every other command or shell failure.

In `--json` mode the shell writes exactly one stable JSON document followed by one newline to
stdout for both success and expected failure; stderr remains empty. JSON contains no ANSI escape
sequences or human table formatting, and the same exit-status mapping still applies.

## Deferred capabilities

`add`, `export`, `generate`, and `import` are absent from the initial descriptors and invocation
union. Their names do not grant filesystem, package-manager, renderer, or Build capabilities to
the current context.

An accepted future command may add a narrow explicit effect capability. `import` remains
conditional on the separate Build viability decision. No deferred command can change Core values,
catalogue membership, or this package's dependency direction implicitly.

The package and public-boundary rationale are recorded by
[0008: Public Plugin-compatible Aster CLI Boundary](../decisions/0008-public-plugin-compatible-aster-cli-boundary.md).
