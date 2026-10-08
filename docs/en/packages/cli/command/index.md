# CLI Command

Status: **Accepted**

The command feature defines structured host-neutral requests, explicit execution capabilities,
immutable help metadata, and serialisable results. It does not parse Node argv or present terminal
output.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `AsterCommandSet` | Declares stable command-set identity, canonical descriptors, and asynchronous execution. | Accepts `AsterCommandInvocationType` and `AsterCommandContext`; returns `AsterCommandResultType`. |
| `AsterCommandDescriptor` | Carries one command identity, summary, and accepted usage forms. | Uses `AsterCommandNameType`; definitions own the source metadata and the kernel exposes isolated copies. |
| `AsterCommandContext` | Supplies the complete capability set for one execution. | Retains explicit providers, product identity, and optional source-tagged package, dependency, and CLI-location evidence; contains no host effects. |
| `AsterInstalledPackageVersion` | Describes one host-supplied installed public package name and version. | Used by package-version and dependency evidence; acquisition belongs to the shell or another host. |
| `AsterPackageVersionEvidence` | Identifies the source and installed records for a package-version request. | Supplies `packageVersions` in `AsterCommandContext`; its `source` is `project` or `cli`. |
| `AsterPackageDependencyGroup` | Separates one installed root from its direct installed Aster runtime dependencies. | Each member of `AsterPackageDependencyEvidence.groups` is independently resolved by the host. |
| `AsterPackageDependencyEvidence` | Groups dependency results by their selected-root source. | Supplies `packageDependencies` in `AsterCommandContext`; the root is never repeated in its own dependency list. |
| `AsterCliLocationEvidence` | Identifies the executed CLI module and its comparison with the project's direct CLI. | Supplies opt-in `cliLocation` in `AsterCommandContext`; not a command-selection mechanism. |

The internal `ICommandDefinition` pairs one descriptor with one executable handler. Definitions are
provided explicitly to the kernel and never registered globally.

## Public types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `AsterCommandNameType` | Closed identity union for `export`, `review`, `list`, `search`, `show`, `help`, and `version`. | Derived from the internal immutable command-name authority. |
| `AsterInstalledPackageSelectorType` | Closed union for `core`, `icons`, `svg`, and `cli`. | Used by the optional `version` invocation scope; `all` selects the complete public family. |
| `AsterVersionScopeType` | One installed package selector or the complete `all` scope. | Used by scoped version invocations and the private installed-manifest reader. |
| `AsterPackageVersionSourceType` | Closed `project` or `cli` provenance of selected package roots. | Shared by package-version and dependency evidence. |
| `AsterCliLocationStatusType` | Closed `same`, `different`, `absent`, `no-project`, or `unavailable` comparison outcome. | Used by `AsterCliLocationEvidence`, not inferred from version strings. |
| `AsterCommandListSubjectType` | Closed subject union for `catalogues`, `collections`, and `icons`. | Derived from the list branch of the immutable command-subject authority. |
| `AsterCommandShowSubjectType` | Closed subject union for `icon` and `collection`. | Derived from the show branch of the immutable command-subject authority. |
| `AsterCommandInvocationType` | Discriminated structured request union with command-specific subjects and filters. | Validated and isolated by the [Command Invocation](invocation/index.md) subfeature. |
| `AsterCommandPayloadKindType` | Closed discriminator union for every current success payload. | Derived from the immutable payload-kind authority. |
| `AsterCommandPayloadType` | Closed union of export, review, discovery, help, product version, package versions, and package dependencies. | Retains source-tagged version evidence and optional CLI location only when requested. |
| `AsterCommandResultType` | Generic structured success or failure outcome. | Success defaults to `AsterCommandPayloadType`; failure retains `AsterCommandDiagnosticType`. |
| `AsterCommandDiagnosticType` | Stable code, category, message, and optional related-value evidence. | Its categories and codes derive from one immutable runtime schema. |
| `AsterCommandDiagnosticCodeType` | Closed stable diagnostic-code union. | Derived from the code branch of the immutable diagnostic schema. |
| `AsterCommandDiagnosticCategoryType` | Closed stable diagnostic-category union. | Derived from the category branch of the immutable diagnostic schema. |

The internal `TAcceptanceResult<Value>` carries either one canonical boundary value or one
structured rejection without throwing an expected command error.

## Invocation semantics

Command-specific normalisers validate the complete accepted invocation union. They reject unknown own
fields, unknown commands, missing values, invalid subjects, non-canonical filters and identities,
and duplicate tags. It copies and freezes every retained sequence.

Search queries are trimmed and lowercased. Provider identities and tags use canonical ASCII
lowercase kebab-case. Collection identities use `[namespace/]name`; icon identities additionally
permit `@variant`.

Export accepts an exact icon or collection identity, an optional provider filter, and a closed
portable option record. Icon export additionally accepts `label` and `title`. The complete export
contracts and execution flow are documented by [CLI Export](../export/index.md).

Review accepts an exact icon or collection identity and an optional provider filter. It returns a
technical plan without accepting host output state. Its contracts and execution flow are
documented by [CLI Review](../review/index.md).

`{ command: "version" }` retains the product-only payload. The `cli` scope uses the same executed
CLI version supplied by the host. Named library scopes and `all` require `project`-sourced
`packageVersions`; `all` returns only directly installed known Aster packages in canonical order,
and may be empty. Setting `dependencies: true` instead requires complete source-tagged
`packageDependencies`: the executed CLI for absent or `cli` scope, or project roots for named
libraries and `all`. Each `groups` entry has one `root` and its own direct `dependencies`.
Setting `location: true` is accepted only for absent or `cli` scope and requires `cliLocation`.
The command validates and isolates host evidence but does not read manifests, query a registry,
or infer missing versions. Missing or mismatched evidence produces `ASTER-CLI-002`.

The exact implemented standalone grammar is documented by [CLI Shell](../shell/index.md). Node
token parsing and output publication are not part of the command kernel.

## Runtime

[Command Invocation](invocation/index.md) documents programmatic input acceptance and bounded
command composition. [Command Runtime](runtime/index.md) documents context acceptance,
deterministic execution dispatch, and sanitised failure flow.
