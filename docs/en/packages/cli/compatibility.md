# CLI Compatibility and Conformance

Status: **Pre-release**

This document defines the compatibility-bearing surface and release evidence for `@aster/cli`.
Detailed command, catalogue, and executable semantics remain owned by their respective package
feature documents.

## Runtime compatibility

The package distributes native ESM targeting ES2022 and provides no CommonJS, legacy, or alternate
build. The programmatic root has no Node or DOM ambient dependency. The package manifest declares
`>=24.10.0 <25` as the supported Node range for the standalone `aster` executable.

The Node shell is a referenced TypeScript project. It consumes host-neutral declarations and emits
only private shell modules, so Node ambient types cannot alter the host-neutral implementation or
its public declarations.

## Supported ABI

The first supported ABI consists of:

- the root package export and private `aster` binary mapping;
- the frozen `AsterCommands`, `AsterCatalogue`, `catalogueResultKinds`, and `exportTargets` values;
- every public command, catalogue, and export contract and type exported through the root;
- the `aster` command-set identity;
- the `export`, `list`, `search`, `show`, `help`, and `version` invocation variants;
- current payload and catalogue-result discriminators;
- current diagnostic codes and categories;
- deterministic ordering, canonicalisation, and expected-failure semantics.

Implementation modules and the executable module are not exportable package subpaths. The package
declares no generic plugin registration ABI and performs no automatic plugin discovery.

Removing, renaming, or reinterpreting an accepted command, discriminator, field, diagnostic, or
observable semantic is a breaking CLI change. Adding an optional compatible command or capability
is additive; correcting implementation without changing the accepted result is compatible.
Deferred commands are not part of the current ABI. Cross-package release sequencing belongs to
the project release posture rather than this package contract.

## Programmatic and standalone equivalence

An independent host can mount `AsterCommands` under its stable identity and invoke it with an
explicit `AsterCommandContext`. It does not import the shell or emulate argv. Given the same
structured invocation, product metadata, and catalogue providers, it receives the same structured
result that the standalone executable serialises in JSON mode.

Importing the root produces no terminal output, process mutation, catalogue load, filesystem
access, network access, or package-manager action. `AsterCatalogue` is never ambient:
`AsterCommands` observes it only when a host explicitly includes that provider in the context.

## Machine and process guarantees

The stable structured result is the machine boundary. JSON mode emits exactly one compact result
document and one trailing newline without ANSI styling. Object property order is deterministic for
the current implementation, but consumers must use named fields and discriminators rather than
treating serialised property order as semantic.

Only the private executable entrypoint reads argv, writes process streams, and assigns process
exit status. Exact human and JSON stream selection and exit statuses are owned by the
[CLI Shell](shell/index.md). Command result and diagnostic semantics are owned by the
[CLI Command](command/index.md).

## Catalogue isolation

Catalogue providers are supplied explicitly and invoked once per command execution. Provider
registration order cannot change accepted ordering or selected results. Snapshots and retained
portable values are validated, copied where required, and frozen before query behaviour becomes
observable. No result relies on source files, a mutable global registry, or catalogue object
insertion order.

Provider and membership guarantees are owned by the
[CLI Catalogue](catalogue/index.md).

## Export isolation

Headless export consumes only accepted catalogue snapshots and the public SVG renderer. It returns
complete immutable logical artefacts and acquires no process or filesystem capability. The shell
may present a raw single-icon SVG or serialise the same structured plan. Its private output host
can stage and publish that plan without changing the programmatic result contract. Shell render
options become the same portable option record before command execution. Detailed ownership is documented by
[CLI Export](export/index.md).

## Conditional Flora seam

The current `@aster/cli` package is a complete standalone product. It owns both the host-neutral
`AsterCommands` composition and the private Node shell; neither `@aster/commands` nor
`@aster/flora` exists or forms part of the supported ABI.

If an independent Flora consumer and stable Flora plugin contract demonstrate a separate
installation or versioning need, the host-neutral domain may be extracted without inverting
dependencies:

```text
@aster/commands <---- @aster/cli
        ^
        |
@aster/flora -------> @flora/core
```

`@aster/commands` would retain structured Aster invocations, explicit contexts, catalogue
selection, and immutable export plans. `@aster/cli` would remain the standalone executable and
default Icons composition. `@aster/flora` would adapt the same Aster command domain to Flora's
public plugin ABI; Flora would not acquire Aster domain behaviour and portable Aster packages
would not depend on either host.

Extraction is not authorised merely to reorganise files. Until both triggers exist, the current
package boundary remains canonical. Broader product sequencing is recorded by
[Future Flora Integration](../../future-capabilities.md#future-flora-integration).

## Conformance evidence

Package conformance builds the distribution and verifies:

- exact runtime values, export map, binary mapping, declarations, and rejected subpaths;
- host-neutral declaration imports and dependency direction;
- exclusive Node process authority in the executable entrypoint;
- package dry-run, local tarball installation, strict engine acceptance, binary linking, and root
  import behaviour in a temporary consumer containing no workspace source files;
- standalone and independent programmatic-host discovery and complete export equivalence;
- explicit catalogue registration and registration-order independence;
- byte-equivalent publication of the complete built-in collection from a clean consumer;
- byte-equivalent export plans across provider-record and membership order;
- empty collections, variants, namespaced paths, malformed providers, path collisions, target
  failures, and caller-controlled exceptions;
- safe private output mapping, absent parents, existing targets, interrupted stages, filesystem
  failures, current-stage cleanup, empty-plan non-mutation, and deterministic fresh-root output;
- executable human, JSON, stream, diagnostic, and exit-status behaviour;
- raw SVG redirection, exact export-option parsing, committed output summaries, and reserved
  output conflict and failure diagnostics.

Run the package evidence with:

```sh
pnpm --dir packages/cli run test:conformance
```

The complete execution boundary is defined by [CLI Workflow](workflow.md); feature-specific
observable semantics remain with Command, Catalogue, Export and Shell.
