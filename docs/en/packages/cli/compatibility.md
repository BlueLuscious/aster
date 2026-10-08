# CLI Compatibility and Conformance

Status: **Accepted**

This page defines CLI's compatibility-bearing boundary. [API](api/index.md) owns the exact export
families, feature pages own semantics, and [quality](quality.md) owns verification evidence.

## Runtime compatibility

CLI distributes native ES2022 ESM with no CommonJS or alternate build. The manifest declares Node
`>=24.10.0 <25` for the standalone executable. The programmatic root admits neither Node nor DOM
ambient types. A referenced shell project consumes its declarations and emits only private
binary modules, without shell declarations.

Only the root export and manifest binary mapping are supported. Emitted implementation modules
are not public subpaths; there is no plugin-registration or automatic-discovery ABI.

## Supported ABI

Compatibility includes the six [runtime values](api/index.md#package-exports), all exported
contracts and types, command-set identity, accepted invocations, payload discriminators,
diagnostics, canonical ordering, source-selection semantics and expected failures.

Removing, renaming or reinterpreting accepted observable behaviour is breaking. A compatible
optional capability is additive; a correction preserving the accepted result is compatible.
[Project versioning](../../project/versioning.md) governs version selection and dependency coordination.
Unimplemented proposals are not current ABI.

## Programmatic and standalone equivalence

An independent host executes structured requests without emulating argv or importing shell
services. Equivalent invocations and complete explicit contexts produce the same structured
result presented by the standalone shell in JSON mode. Importing the root is silent and performs
no catalogue discovery, filesystem access, network request or process mutation.

JSON fields and discriminators are semantic; serialised property order is not a compatibility
contract. [Shell](shell/index.md) owns exact framing, stream selection and statuses.

## Capability boundaries

| Boundary | Compatibility owner |
| --- | --- |
| Explicit provider methods, metadata-only discovery, exact loaders and collection membership | [Catalogue](catalogue/index.md) |
| Executed-CLI versus project roots, source-tagged host evidence and grouped dependencies | [Command](command/index.md) and [version acquisition](shell/version/index.md) |
| Complete logical SVG artefacts without host effects | [Export](export/index.md) |
| Complete technical models and separate pure HTML serialisation | [Review](review/index.md) |
| Private filesystem staging, guarded replacement and recovery limitations | [Output](shell/output/index.md) |

Collection definitions use Core's alias dictionary and derived `members`; discovery retains only
member identities. Collection-local aliases are not identity shortcuts. Historical migrations
belong to the [version history](releases/index.md), not current usage.

## Conditional Flora seam

CLI is a complete standalone package; no Commands or Flora package is part of its ABI. Extraction
requires the independent consumer and dependency evidence described by
[Command-set Extraction and Flora Integration](../../future-capabilities.md#command-set-extraction-and-flora-integration).
