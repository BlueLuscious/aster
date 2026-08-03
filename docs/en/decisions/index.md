# Decision Records

Status: **Accepted**

Decision records preserve the context, alternatives, choice, and consequences of material Aster
architecture changes. Current observable contracts remain in canonical architecture and governance
documents; records explain why those contracts changed.

## Location and naming

Records live in `docs/en/decisions/` and use:

```text
NNNN-kebab-case-title.md
```

Identifiers are four-digit, monotonically increasing repository-wide, and never reused. Renaming a
record after acceptance is prohibited except to correct a broken link without changing its
identifier.

The editable starting structure is [Decision Record Template](template.md).

## Required records

A decision record is required for a material change to:

- public data, options, renderer results, or generated module contracts;
- package or dependency boundaries;
- canonical identity, variant, deprecation, or compatibility policy;
- security and source-acceptance policy;
- collection ownership or approval authority;
- production dependencies with architectural consequences;
- a previously accepted architecture or governance contract.

Reversible private implementation detail does not require a record unless it creates an observable
constraint or contradicts accepted documentation.

## Status lifecycle

| Status | Meaning |
| --- | --- |
| Proposed | Alternatives and consequences are under review; implementation cannot treat the proposal as accepted. |
| Accepted | Required owners approved the decision and canonical current-contract documentation was updated. |
| Rejected | The proposal was considered and declined; it has no implementation authority. |
| Superseded | A later accepted record replaced the decision; historical context remains immutable. |

Allowed transitions are:

```text
Proposed -> Accepted
Proposed -> Rejected
Accepted -> Superseded
```

Accepted, Rejected, and Superseded records do not return to Proposed. Reversing an accepted choice
requires a new Proposed record.

## Acceptance and supersession

A record names its decision owners. Technical contracts require technical-maintainer approval;
collection rules require curator approval; cross-boundary decisions require both.

Accepting a record requires:

- completed context, options, decision, consequences, and evidence;
- links to affected canonical documents;
- compatibility and migration analysis where applicable;
- implementation or evidence assignments for deferred consequences;
- required owner approval.

When superseded, the old record adds only its `Superseded` status and `supersededBy` link. The new
record links back through `supersedes`. Accepted decision prose is otherwise immutable apart from
typographical or link corrections that do not change meaning.

The current contract is incorporated into the relevant architecture or governance source of truth.
A record does not force consumers to reconstruct current behaviour from a chain of historical
decisions.

## Index maintenance

Every record is linked from this index in identifier order with title, status, owners, and affected
domain. Repository verification rejects duplicate identifiers, invalid transitions, missing
supersession links, and unindexed records.

| Record | Status | Owners | Domain |
| --- | --- | --- | --- |
| [0001: pnpm and TypeScript Workspace Toolchain](0001-pnpm-typescript-workspace-toolchain.md) | Accepted | Technical maintainers | Repository toolchain |
| [0002: Private Build-time Domain Package](0002-private-build-time-domain-package.md) | Accepted | Technical maintainers | Build-time product domain |
| [0003: Private XML Parser Boundary](0003-private-xml-parser-boundary.md) | Accepted | Technical maintainers | SVG ingestion safety |
| [0004: JSON Metadata for SVG Imports](0004-canonical-json-metadata-sources.md) | Accepted | Technical maintainers | SVG-import metadata serialisation |
| [0005: Public SVG Renderer Boundary](0005-public-svg-renderer-boundary.md) | Accepted | Technical maintainers | Public SVG target and package API |
| [0006: Public Portable Runtime Authorities](0006-public-portable-runtime-authorities.md) | Accepted | Technical maintainers | Core runtime value API |
| [0007: TypeScript-first Aster Collection Package](0007-typescript-first-aster-collection-package.md) | Accepted | Technical maintainers and Aster collection curator | Collection authoring and distribution |
| [0008: Public Plugin-compatible Aster CLI Boundary](0008-public-plugin-compatible-aster-cli-boundary.md) | Accepted | Technical maintainers | CLI package and command-host boundary |
