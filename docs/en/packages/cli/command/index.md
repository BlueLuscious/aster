# CLI Command

Status: **Experimental**

The command feature defines structured host-neutral requests, explicit execution capabilities,
immutable help metadata, and serialisable results. It does not parse Node argv or present terminal
output.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `AsterCommandSet` | Declares stable command-set identity, canonical descriptors, and asynchronous execution. | Accepts `AsterCommandInvocationType` and `AsterCommandContext`; returns `AsterCommandResultType`. |
| `AsterCommandDescriptor` | Carries one command identity, summary, and accepted usage forms. | Uses `AsterCommandNameType`; definitions own the source metadata and the kernel exposes isolated copies. |
| `AsterCommandContext` | Supplies the complete capability set for one execution. | Retains explicit `CatalogueProvider` values plus product name and version; contains no host effects. |

The internal `ICommandDefinition` pairs one descriptor with one executable handler. Definitions are
provided explicitly to the kernel and never registered globally.

## Public types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `AsterCommandNameType` | Closed identity union for `list`, `search`, `show`, `help`, and `version`. | Derived from the internal immutable command-name authority. |
| `AsterCommandListSubjectType` | Closed subject union for `catalogues`, `collections`, and `icons`. | Derived from the list branch of the immutable command-subject authority. |
| `AsterCommandShowSubjectType` | Closed subject union for `icon` and `collection`. | Derived from the show branch of the immutable command-subject authority. |
| `AsterCommandInvocationType` | Discriminated structured request union with command-specific subjects and filters. | Validated and isolated by `CommandInvocationNormaliser`. |
| `AsterCommandPayloadKindType` | Closed discriminator union for every current success payload. | Derived from the immutable payload-kind authority. |
| `AsterCommandPayloadType` | Closed union of list, search, show, help, and version payloads. | Retains public catalogue results or command descriptors according to its kind. |
| `AsterCommandResultType` | Generic structured success or failure outcome. | Success defaults to `AsterCommandPayloadType`; failure retains `AsterCommandDiagnosticType`. |
| `AsterCommandDiagnosticType` | Stable code, category, message, and optional related-value evidence. | Its categories and codes derive from one immutable runtime schema. |
| `AsterCommandDiagnosticCodeType` | Closed stable diagnostic-code union. | Derived from the code branch of the immutable diagnostic schema. |
| `AsterCommandDiagnosticCategoryType` | Closed stable diagnostic-category union. | Derived from the category branch of the immutable diagnostic schema. |

The internal `TAcceptanceResult<Value>` carries either one canonical boundary value or one
structured rejection without throwing an expected command error.

## Invocation semantics

The normaliser validates the complete accepted invocation union. It rejects unknown own
fields, unknown commands, missing values, invalid subjects, non-canonical filters and identities,
and duplicate tags. It copies and freezes every retained sequence.

Search queries are trimmed and lowercased. Provider identities and tags use canonical ASCII
lowercase kebab-case. Collection identities use `[namespace/]name`; icon identities additionally
permit `@variant`.

The exact future standalone grammar remains canonical in the
[Command-line Boundary](../../../architecture/command-line-boundary.md). Node token parsing is not
part of the current kernel.

## Runtime

[Command Runtime](runtime/index.md) documents context acceptance, invocation acceptance,
deterministic dispatch, and sanitised failure flow.
