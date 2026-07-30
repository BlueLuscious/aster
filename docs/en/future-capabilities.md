# Future Capabilities

Status: **Proposed**

This document records deliberate improvement opportunities that are not current product
guarantees. Each capability remains optional until its implementation trigger is reached and any
material public or dependency decision is accepted separately.

## Recommended sequence

| Window | Capability |
| --- | --- |
| Before the first public release or externally supported contribution workflow | Activate linting and non-mutating formatting verification. |
| After the first end-to-end product flow is implemented and package documentation is self-contained | Consolidate transversal documentation around a concise project-level summary. |
| After parser conformance provides sufficient replacement evidence | Consider an Aster-owned XML tokeniser and parser adapter. |

## Active linting and formatting verification

The root `lint`, `format`, and `format:check` commands are stable delegators, but no package
currently implements their contracts. Before the first public release or an externally supported
contribution workflow, select either repository-owned checks or a replaceable external tool and
activate the non-mutating checks in `pnpm check`.

The implementation should enforce objective source invariants without duplicating TypeScript,
architecture, documentation, or human prose review. Any external tool must remain an exact,
development-only dependency behind the existing root commands.

The accepted replacement boundary is defined by
[Workspace and Tooling](governance/workspace-and-tooling.md).

## Project-centred documentation consolidation

Architecture, collection, decision, and governance documents remain useful while Aster is
establishing package boundaries and product guarantees. Package documentation should continue to
be written as the detailed source of truth for what each package does independently, how its
features work, and how packages compose without duplicating related material.

After Aster has one complete flow from source ingestion to portable definition and at least one
distribution or rendering adapter, audit the transversal documentation. Consolidation should
begin only when package documentation is self-contained and stable enough to support that audit.

At that point:

- create either `docs/en/project.md` or a small `docs/en/project/` composition;
- summarise the product manifest, architecture, package relationships, and most important
  guarantees at project level;
- retain specialised architecture, collection, decision, or governance documents only when
  their detail remains materially useful;
- migrate unique active guarantees before removing a document;
- replace repeated explanations with links to package or project authorities;
- preserve significant decision rationale when losing it would make future maintenance or
  compatibility choices harder.

The result should make project-level documentation concise while allowing package documentation
to speak for the implementation. Consolidation must not erase collection provenance, licensing,
accepted compatibility guarantees, or rationale that still governs observable behaviour.

The current hierarchy and non-duplication rules remain defined by the
[Documentation Policy](governance/documentation-policy.md) until consolidation is accepted.

## Aster-owned XML tokeniser

`xmlsax-typescript` is isolated behind Aster-owned parser contracts. An Aster-owned tokeniser may
replace that adapter when dependency maintenance, security, performance, source-location
precision, or grammar control provides concrete evidence that replacement is worthwhile.

Replacement should begin only after parser conformance fixtures cover the accepted SVG subset,
rejected XML capabilities, safety limits, inert sections, namespace handling, malformed input,
and exact source spans. At that point Aster may own runtime token discriminators instead of
mirroring an external ABI, while the syntax document and downstream pipeline contracts remain
unchanged.

The current replaceable dependency boundary is defined by
[0003: Private XML Parser Boundary](decisions/0003-private-xml-parser-boundary.md).

## Minimal Aster CLI

No production host currently discovers SVG import sources or commits generated package output.
Introduce `@aster/cli` when a real SVG-import or persistent TypeScript-to-target export workflow
needs a user-facing host.

For SVG import, the initial CLI should remain a small Node adapter over `@aster/build`: select an
explicit source root and output root, strictly decode source bytes, run
`CollectionBuildPipeline`, present diagnostics, and commit only complete successful output.

For TypeScript-first export, the CLI should accept one explicit `IconDefinition`, an explicit
selected set, or one `CollectionDefinition`; delegate target conversion to an installed renderer;
derive collision-safe filenames from portable identity; and atomically commit only the complete
result below an explicit output root. A renderer must not acquire filesystem or process authority,
and collection membership must remain optional for single-icon export.

Keep parser, metadata, validation, normalisation, and generator responsibilities in private
`@aster/build`. Review further package extraction only after an independent host or authoring
consumer demonstrates distinct versioning, dependencies, lifecycle, or consumers.
