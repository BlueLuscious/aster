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
| `AsterCommandListSubjectType` | Closed subject union for `catalogues`, `collections`, `glyphs` and `icons`. | Derived from the list branch of the immutable command-subject authority. |
| `AsterCommandShowSubjectType` | Closed subject union for `glyph`, `icon` and `collection`. | Derived from the show branch; Export and Review retain their separate concrete-only subjects. |
| `AsterCommandInvocationType` | Discriminated structured request union with command-specific subjects and filters. | Validated and isolated by the [Command Invocation](invocation/index.md) subfeature. |
| `AsterCommandPayloadKindType` | Closed discriminator union for every current success payload. | Derived from the immutable payload-kind authority. |
| `AsterCommandPayloadType` | Closed union of export, review, discovery, help, product version, package versions, and package dependencies. | Retains source-tagged version evidence and optional CLI location only when requested. |
| `AsterCommandResultType` | Generic structured success or failure outcome. | Success defaults to `AsterCommandPayloadType`; failure retains `AsterCommandDiagnosticType`. |
| `AsterCommandDiagnosticType` | Correlated stable code/category, deterministic message and applicable supporting details. | Uses `AsterCommandDiagnosticDetailsType`; both derive their closed vocabulary from the immutable diagnostic schema. |
| `AsterCommandDiagnosticDetailsType` | Discriminated supporting facts with explicit provider, lookup, selection, member and artefact roles. | Required only by the diagnostic families described below; an individual icon selection cannot carry a failing collection member. |
| `AsterCommandDiagnosticCodeType` | Closed stable diagnostic-code union. | Derived from the code branch of the immutable diagnostic schema. |
| `AsterCommandDiagnosticCategoryType` | Closed stable diagnostic-category union. | Derived from the category branch of the immutable diagnostic schema. |

The internal `TAcceptanceResult<Value>` carries either one canonical boundary value or one
structured rejection without throwing an expected command error.

## Diagnostic details

Failures retain a stable `code`, its corresponding `category` and a deterministic `message`.
Applicable families also carry `details` with an explicit `kind`; consumers discriminate these
facts rather than interpret message wording. The internal factory copies retained containers and
freezes them without freezing provider-owned inputs. It constructs typed accepted facts, not
arbitrary external JSON. Native exception text is not supporting evidence.

| Code | Detail kind | Supporting facts |
| --- | --- | --- |
| `ASTER-CLI-003` | `catalogues` or `catalogue` | Complete received provider identities, including repeated claims, or the responsible discovery provider. |
| `ASTER-CLI-004` | `lookup` | Explicit `subject` (`catalogue`, `icon`, `glyph` or `collection`) and requested `identity`. |
| `ASTER-CLI-005` | `ambiguity` | Requested `subject`/`identity` and at least two distinct candidate `catalogues` in canonical order. |
| `ASTER-CLI-006` | `catalogue` or `definition` | Responsible provider; a definition failure also retains `selection.kind` (`icon` or `collection`) and `selection.identity`. Only a collection selection may carry a known failing `member` icon identity. |
| `ASTER-CLI-007` | `export-render` or `review-render` | Logical artefact `path` for Export, or concrete `icon` identity for Review. |
| `ASTER-CLI-008` | `path-conflict` | Logical artefact `path` claimed by multiple selected definitions. |

Codes `001`, `002`, `009`, `010`, `011` and `999` have no additional accepted supporting facts
and do not carry `details`. Optional member evidence remains absent for collection-wide failures.
No identity, namespace, treatment or provider is inferred from a message or a position in an array.
[Shell presentation](../shell/presentation/index.md#diagnostic-evidence) owns human labels and framing;
JSON retains these structured facts unchanged.

## Invocation semantics

[Invocation normalisers](invocation/index.md) validate the complete command-specific shape,
copy retained values and freeze accepted containers. Unknown fields or commands, missing values,
invalid subjects, non-canonical identities/filters and duplicate tags are usage failures.

Search queries are trimmed and lowercased. Textual identity and tag acceptance follow the
[shared CLI grammar](../shared/index.md).

Glyph list/show use `glyph-list` (`glyphs`) and `glyph-show` (`glyph`) payloads containing
`CatalogueGlyphResult`. The `glyph?: string` filter applies only to icon listing, not Search or
other list subjects. [Catalogue semantics](../catalogue/index.md#discovery-semantics) owns exact
family matching, supported filter combinations, ordering, empty results and ambiguity.

Export accepts an exact icon or collection identity, an optional provider filter, and a closed
portable option record. Icon export additionally accepts `label` and `title`. The complete export
contracts and execution flow are documented by [CLI Export](../export/index.md).

Review accepts an exact icon or collection identity and an optional provider filter. It returns a
technical plan without accepting host output state. Its contracts and execution flow are
documented by [CLI Review](../review/index.md).

`{ command: "version" }` retains the product-only payload. The `cli` scope uses the same executed
CLI version supplied by the host. Named library scopes and `all` require `project`-sourced
`packageVersions`; `all` returns only directly installed known Aster packages in canonical order,
and may be empty. The public family order is Core, Icons, SVG, CLI.
Setting `dependencies: true` instead requires complete source-tagged
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
