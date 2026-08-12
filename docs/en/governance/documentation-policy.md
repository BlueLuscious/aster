# Documentation Policy

Status: **Accepted**

This document defines canonical documentation, language, mirroring, JSDoc, and generated
documentation policy.

## Canonical hierarchy

Canonical English documentation lives under `docs/en/`:

| Path | Responsibility |
| --- | --- |
| `docs/en/index.md` | Entry point for the complete canonical documentation set. |
| `docs/en/future-capabilities.md` | Deferred capabilities, evaluation triggers, and recommended implementation windows. |
| `docs/en/architecture/` | Current accepted product contracts and boundaries. |
| `docs/en/decisions/` | Material decision rationale, alternatives, and consequences. |
| `docs/en/governance/` | Contribution, review, versioning, release, and documentation policy. |
| `docs/en/packages/` | Real package set and package-relative documentation. |
| `docs/en/collections/` | Real collection set and collection-relative design documentation. |
| `docs/en/tooling/` | Real private tooling set and tooling-relative implementation documentation. |

Documentation is canonical only when it is committable, linked from this hierarchy, and
self-contained without contributor-local inputs.

## Language

English is canonical and uses British English for Aster-owned prose, symbol names, diagnostics,
examples, tests, and commit metadata.

Exact externally defined names retain their required spelling, including `package.json#license`,
SVG `currentColor`, CSS `color`, and platform attributes.

A future translation uses `docs/<locale>/` and preserves the same relative hierarchy. A
translation links to the canonical English contract when it is not yet current.

## Mirroring

`docs/en/packages/` mirrors `packages/`:

```text
docs/en/packages/<package>/<feature>/<service-or-composition>/
packages/<package>/src/<feature>/<service-or-composition>/
```

The documentation path may omit implementation-only `src`, layer directories, or files when the
domain feature remains unambiguous. It does not invent a package, feature, or service before the
corresponding product boundary exists.

`docs/en/collections/` is keyed by accepted curatorial identity rather than by one prescribed
source root. An Experimental collection may document its identity, curator, lifecycle, licence,
and provisional visual contract before selecting canonical icon authoring authority. It must
state that no icon source or distribution is accepted yet. Authoring workflow, source-relative
exceptions, and generated-output documentation are added only when their ownership is real. If an
accepted source root exists, documentation and source collection identities must agree.

The package and collection indices document the sets generally and may exist before their first
member. Package member directories mirror real package structure. Collection member directories
represent accepted curatorial identities and do not imply a repository root named `collections/`.

`docs/en/tooling/` mirrors real feature roots under `tooling/`. Its index owns shared private
tooling boundaries and each feature directory explains one retained tool independently. Governance
and architecture documents may define cross-cutting policy or dependency direction, but they link
to tooling documentation rather than duplicating implementation structure, commands, or flows.

## Contracts, types, and flows

Every production contract and type has one canonical description covering:

- responsibility and observable semantics;
- invariants and invalid states;
- relationships with other contracts and types;
- ownership and lifecycle where applicable;
- a minimal usage example when it clarifies the contract.

Implemented execution flows are documented from tested behaviour. Speculative flow documentation
is prohibited. Related documents link to one source of truth instead of copying the same contract.

## Production JSDoc

JSDoc is mandatory for all production code, including public, internal, and private:

- APIs, contracts, types, classes, functions, and constants;
- properties, accessors, constructors, and methods;
- managers, engines, factories, adapters, and generated runtime symbols.

Every JSDoc block includes `@description`. It includes `@param` for every parameter, `@returns` for
every function, accessor, or method, and `@typeParam` for every generic parameter. `@remarks`
records non-obvious invariants, ownership, lifecycle, or compatibility context.

Pure imports and barrels that only re-export symbols are exempt. Tests remain exempt until Aster
defines a testing-specific policy.

JSDoc describes stable behaviour and may link canonical documentation. It never mentions local
planning inputs, implementation history, temporary tasks, or contributor-machine paths.

## Generated documentation and code

Generated production symbols follow the same JSDoc standard as authored production code. Their
planner or template is the canonical editable source.

Every generated boundary:

- identifies its canonical inputs and rebuild command;
- marks outputs as generated;
- forbids manual editing;
- constrains cleanup to its declared generated root;
- regenerates documentation and JSDoc deterministically;
- verifies deletion and clean rebuild.

Generated output does not become documentation authority merely because it is published. Canonical
contracts remain in this hierarchy and generated documentation links to them.

## Maintenance

A change is incomplete when code, exports, collection rules, compatibility, or workflow changes
without its corresponding canonical documentation.

Documentation checks protect broken links, forbidden local references, mirroring, required
headers, and generated cleanliness. Checks enforce objective invariants only; they do not measure
prose quality ceremonially or duplicate human review.

Run the stable repository documentation check with:

```sh
pnpm run check:docs
```

The command validates repository structure, mirroring, local links, decision record shape, and
forbidden local references without imposing subjective prose rules. Its implementation is
described by [Documentation Tooling](../tooling/documentation/index.md) and may be replaced without
changing this policy or the command contract.

Source ownership and the separation between authored and generated artefacts are defined by the
[Source Assets and Generated Outputs](source-assets-and-generated-outputs.md) policy.
