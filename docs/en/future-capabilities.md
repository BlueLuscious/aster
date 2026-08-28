# Future Capabilities

Status: **Proposed**

This document records prioritised improvement opportunities that are not current product
guarantees. Each capability remains optional until its implementation trigger is reached and any
material public, package, or dependency decision is accepted separately.

## Importance levels

| Level | Meaning |
| --- | --- |
| `P0 - Required` | Must be resolved before Aster expands its supported product surface. |
| `P1 - High` | Provides substantial user or maintenance value after its foundations are stable. |
| `P2 - Conditional` | Proceeds only when measured evidence or a real consumer justifies it. |
| `P3 - Finalisation` | Consolidates the project after product and package boundaries settle. |
| `P4 - Deferred` | Explicitly postponed integration work with no current implementation commitment. |

Priority expresses importance, not permission to ignore dependencies. A lower-numbered capability
may still wait for an earlier prerequisite in the recommended sequence.

## Recommended sequence

| Order | Importance | Capability | Completion gate |
| --- | --- | --- | --- |
| 1 | `P0` | Define the standalone and plugin-compatible CLI command boundary. | Commands can run through injected host capabilities without owning a generic ecosystem CLI. |
| 2 | `P0` | Completed: harden private repository tooling. | Stable root commands use independently testable object-oriented runtime boundaries without obsolete pilot hosts. |
| 3 | `P0` | Completed: audit and harden `@aster/core`. | Its model, API, validation, immutability, performance, exports, consumers, and documentation have explicit outcomes. |
| 4 | `P0` | Completed: audit and harden `@aster/svg`. | Serialisation correctness, performance, API, output, and package-boundary risks have explicit outcomes independently from Core. |
| 5 | `P1` | Completed: implement useful catalogue and TypeScript-first CLI workflows. | Users can inspect and export installed icons and collections without requiring `@aster/import`. |
| 6 | `P0` | Completed: replace Build with narrow `@aster/import` adoption. | External SVG adoption remains host independent and emitted TypeScript becomes human-owned source. |
| 7 | `P1` | Host and harden the retained Import boundary. | A real CLI or programmatic workflow validates acquisition, review, persistence, and package conformance. |
| 8 | `P2` | Consider an Aster-owned XML tokeniser. | Import is retained and parser conformance and maintenance evidence justify replacement. |
| 9 | `P2` | Activate objective linting and formatting verification. | The first supported release or external contribution workflow requires enforceable source checks. |
| 10 | `P2` | Evaluate headless repository-tooling extraction. | A second repository needs the same host-neutral kernels and can supply independent policies. |
| 11 | `P3` | Consolidate project documentation. | Package documentation is self-contained and all preceding package decisions are stable. |
| 12 | `P4` | Begin the Lilium adapter. | Core and renderer contracts are stable and documentation consolidation is complete. |

## Plugin-compatible Aster CLI

Importance: **P0 - Required**

The initial command and host separation is accepted by the
[Command-line Boundary](architecture/command-line-boundary.md). The command kernel and explicit
catalogue composition, standalone shell, and package conformance now exist.

`@aster/cli` should provide a useful standalone `aster` executable without embedding command
behaviour directly into argument parsing, terminal output, process exit state, or filesystem
globals. Command definitions and handlers should receive explicit host capabilities so the same
Aster command set can later run in either of these forms:

- the standalone Aster CLI;
- an Aster plugin registered in a separate headless multi-ecosystem CLI;
- a programmatic or test host with no terminal process.

Aster should not build the generic plugin framework before that independent project has real
requirements. The initial boundary should merely avoid preventing extraction: stable command
identity, explicit input and result contracts, injected catalogue and effect capabilities, no
ambient mutable registry, and a thin Node shell. If independent consumers later justify it, the
host-neutral command set may move to a separate package such as `@aster/commands`, while
`@aster/cli` remains the executable adapter.

The current command family deliberately uses explicit invocation, argument, and human presentation
dispatch. When the next substantial command family such as `add`, `generate`, `import`, or
`review` is accepted, reassess that pressure and extract further vertical command adapters or explicit
registrations if doing so localises validation, shell parsing, and presentation changes. Do not
introduce inheritance hierarchies, automatic command discovery, or a generic registry merely to
remove small exhaustive switches.

Plugin compatibility must work in both directions without dependency inversion. A generic host
may load Aster commands as one plugin alongside commands from other ecosystems. The standalone
Aster CLI may eventually load explicitly compatible catalogue or target plugins, but Aster Core,
Icons, SVG, Lotus, Lilium, and unrelated projects must never depend on the CLI.

### Future Flora integration

Flora is the prospective headless multi-ecosystem CLI host. Aster must integrate through an
optional adapter rather than making its command domain or portable packages depend directly on
Flora. If an independent Flora consumer and stable plugin contract justify package extraction,
the intended dependency direction is:

```text
@aster/core <- @aster/svg <- @aster/commands
                              ^           ^
                              |           |
                         @aster/cli   @aster/flora -> @flora/core
                              |
                         @aster/icons
```

`@aster/commands` would own host-neutral structured commands, validation, catalogue selection,
and immutable target plans. `@aster/cli` would remain Aster's standalone Node executable and
compose the default Icons catalogue. `@aster/flora` would adapt Flora plugin invocations and
capabilities to the same Aster command set without moving Aster behaviour into Flora.

Flora would route an explicit Aster namespace and remain independent from Aster packages. Target
plans would stay effect-free: the standalone Aster host or Flora capability host would decide how
to present or publish them. Flora, Aster Core, Icons, SVG, Lotus, Lilium, and unrelated consumers
must not acquire reverse dependencies through this integration.

Do not create `@aster/commands` merely to reorganise files, and do not create `@aster/flora` before
Flora exposes a minimal stable plugin ABI and one real Aster integration scenario. Until those
conditions exist, `@aster/cli` retains both the host-neutral command composition and its private
standalone shell while preserving their current boundary.

## Catalogue and command capabilities

Importance: **P1 - High**

Status: **Initial TypeScript-first discovery and SVG export workflow completed**

The first useful commands should operate on explicitly installed or configured catalogue
providers and canonical TypeScript definitions. They do not require the SVG importer in
`@aster/import`.

| Command family | Initial responsibility | Import dependency |
| --- | --- | --- |
| `list` | List available catalogue providers, collections, or icons. | None. |
| `search` | Match canonical identity, display name, intrinsic tags, and explicit catalogue indexes. | None. |
| `show` | Display one icon or collection identity, metadata, membership, and available targets. | None. |
| `add` | Integrate selected definitions into a consumer project through an explicit package, import, or vendoring policy. | None initially. |
| `export` | Produce a headless SVG artefact plan for one icon or one collection and optionally publish it through the private Node host. | None for TypeScript-first definitions. |
| `review` | Compose disposable technical and visual evidence through explicit render and output hosts. | None for TypeScript-first definitions. |
| `generate` | Produce explicitly selected manifests, barrels, wrappers, or target integrations through an installed generator. | None unless the selected generator imports SVG. |
| `import` | Acquire external SVG, collect reviewed Core metadata, and adopt editable portable definitions. | Hosts the private Import boundary. |

`add`, `export`, `review`, and `generate` must remain distinct. `add` changes consumer integration,
`export` produces target artefacts such as SVG files, `review` composes disposable comparison
evidence, and `generate` produces code or integration artefacts. No command may silently copy
source, install dependencies, overwrite user files, or infer ownership from a directory name.

The first export workflow has an accepted implementation. It returns complete immutable SVG
artefacts with logical paths from the host-neutral command set, keeps output-root resolution and
filesystem commitment in the standalone shell, forbids initial overwrite, and does not introduce
Import or a generic target registry. `add` remains deferred until consumer integration has one
explicit package, import, or vendoring policy. `generate` requires one concrete generated target;
`review` requires a disposable visual evidence host; and `import` requires explicit source
acquisition, metadata review, output presentation, and persistence capabilities. Generic target
plugins and extraction to `@aster/commands` require independent consumers rather than speculative
abstractions. Exact selection, presentation, staging, and dependency
decisions are defined by
[0010: Headless SVG Export and Node Output Boundary](decisions/0010-headless-svg-export-and-node-output-boundary.md).

CLI discovery must not introduce a runtime global registry. Catalogue providers should supply
explicit manifests or indexes outside `IconDefinition`; collections continue to own only their
explicit membership. Search aliases, collection-specific categories, package provenance, and
computed indexes remain catalogue concerns rather than portable icon metadata.

The pilot built-in provider currently adapts the one canonical collection and its members. Before
the first canonical standalone icon or second canonical collection is published, `@aster/icons`
should expose independent immutable icon and collection indexes and the built-in provider should
adapt both. This preserves discovery of icons with no collection and collections with no members
without assigning catalogue concerns to portable definitions.

The initial CLI should support deterministic machine-readable output in addition to human terminal
formatting. Command failures should return structured Aster-owned results; only the executable
shell maps them to stderr and process exit status.

## Repository tooling hardening

Status: **Completed**

Remove obsolete repository-only product experiments and harden the private tools behind stable
root commands before package performance work depends on them. Architecture, documentation,
cleanup, and performance tooling should use thin entrypoints, object-owned runtime behaviour,
explicit host capabilities, one primary concept per file, and fixture-based conformance.

Tooling may coordinate public built packages but no package may import tooling. Reusable
measurement infrastructure may be shared across package baselines, while every package retains an
independent scenario runner and command. Future user-facing export or review behaviour belongs to
`@aster/cli`, not to permanent repository-only hosts.

The final audit retained only checks with current objective evidence. It removed the inactive
canonical collection-source-root policy, removed ecosystem-name checks duplicated by exact
dependency allowlists, and excluded empty lint and format delegators from the repository check.
Production package imports into private tooling are now rejected uniformly. ABI tests remain
necessary because they inspect emitted public artefacts rather than authored repository structure.

## Headless repository-tooling extraction

Importance: **P2 - Conditional**

The hardened tooling structure permits a future independent headless project, but Aster should not
extract it without a second real repository consumer. Candidate portable capabilities are verifier
orchestration, issue collection, filesystem and path contracts, deterministic traversal, strict
JSON acquisition, benchmark execution, and sample aggregation.

Repository policy is not automatically portable. Aster-specific package identities, dependency
allowlists, compiler requirements, documentation hierarchy, decision-record rules, parser
ownership, cleanup boundaries, and Core performance scenarios must remain Aster-owned policies or
explicit adapters.

If extraction becomes justified, the independent project should expose host-neutral kernels and a
small explicit policy composition boundary. Aster would consume it only as development tooling and
retain its own thin process entrypoints. Do not extract by copying every current verifier, creating
automatic rule discovery, embedding mutable global registries, or combining contributor tooling
with the future user-facing multi-ecosystem CLI.

## Core hardening

Importance: **P0 - Required**

Status: **Completed**

The completed Core audit established the host-independent production boundary before broader CLI
or adapter adoption. Its accepted inventory, workflow, conformance evidence, and remaining
pressure boundaries are documented by [Portable Icon Core](packages/core/index.md) and
[Core Quality](packages/core/quality.md).

The audit confirmed:

- deliberately minimal and symmetric `Icon.define()` and `Collection.define()` APIs;
- exact validation, canonicalisation, caller isolation, deep immutability, and deterministic
  definition errors;
- identity, metadata, tags, replacement relationships, and many-to-many membership invariants;
- representative construction and distribution measurement without CI performance thresholds;
- side-effect-free ES2022 ESM, host-independent declarations, one controlled root export, and no
  production dependency;
- conformance of Icons, SVG, Import, CLI, and implemented repository workflows against the public
  Core boundary.

Canonical definitions should remain plain immutable structural data unless a separate value-object
model demonstrates a material interoperability benefit. Prefer explicit immutable `Icon` or
`Collection` operations over instance setters or mutation methods, and add them only when their
ownership, duplicate, ordering, and return semantics are stable.

## SVG hardening

Importance: **P0 - Required**

Status: **Completed**

The completed SVG audit established:

- deterministic host-free string serialisation with exact XML 1.0 character and escaping rules;
- closed option normalisation, presentation precedence, accessibility, direction, and atomic
  failure guarantees;
- byte-level conformance across every portable primitive, the complete Icons corpus, isolated
  package consumers, and equivalent TypeScript-first and Import adoption workflows;
- a measured single-pass attribute-escaping optimisation with an independent SVG baseline;
- batch export, filesystem, process, DOM, catalogue, lifecycle, and adapter composition remaining
  explicit host responsibilities around atomic `Svg.render()` calls;
- a deliberately unchanged public API because no implemented consumer proves another stable
  target operation.

The accepted boundary and retained evidence are documented by
[SVG Renderer](packages/svg/index.md), [SVG Quality](packages/svg/quality.md), and
[SVG Quality Baseline](packages/svg/quality-baseline.md). Future work cannot add caching,
registries, streaming, mutable singletons, alternate builds, trusted definitions, or convenience
facades without measured benefit and explicit ownership.

## Import adoption hosting

Importance: **P0 - Required**

`@aster/import` provides a narrow optional external-source adoption compiler. It is not
required for TypeScript-first icon authoring, catalogue browsing, search, Core construction, SVG
rendering, or initial CLI export.

The next investment requires one real host workflow:

- importing third-party or vector-tool SVG artwork;
- preserving source locations and stable diagnostics that a simpler importer cannot provide;
- normalising accepted SVG into reviewable portable definitions;
- emitting editable TypeScript without acquiring filesystem authority.

The CLI may eventually acquire files, request complete reviewed Core metadata, call Import, present
diagnostics, and commit explicitly accepted output. Import must continue to own none of those host
effects.

The CLI must not force the decision. Import may power a future `import` command, but catalogue,
search, add, TypeScript-first export, and most generation commands should remain independently
usable.

## Import package hardening

Importance: **P1 - High**

After one real host exists, review Import's API, internal boundaries, duplicated authorities,
performance, diagnostics, parser safety, normalisation, editable serialisation, and distribution.
The host should prove atomic source acquisition and output commitment through explicit contracts.

Do not expose Import merely because the CLI needs one command. The CLI should adapt the narrowest
host-independent Import composition, while source discovery, byte decoding, terminal presentation,
filesystem writes, and process status remain host responsibilities.

## Aster-owned XML tokeniser

Importance: **P2 - Conditional**

Consider replacing `xmlsax-typescript` only after Import has a real host and package conformance. Replacement is
worthwhile only when dependency maintenance, security, performance, source-location precision,
or grammar control provides concrete evidence that the existing adapter is insufficient.

Parser conformance fixtures must first cover the accepted SVG subset, rejected XML capabilities,
safety limits, inert sections, namespace handling, malformed input, and exact source spans. At
that point Aster may own runtime token discriminators rather than mirroring an external ABI, while
the syntax document and downstream pipeline contracts remain unchanged.

Do not create a standalone XML tokeniser without measured Import evidence or another independent
product consumer.

The current replaceable dependency boundary is defined by
[0003: Private XML Parser Boundary](decisions/0003-private-xml-parser-boundary.md).

## Active linting and formatting verification

Importance: **P2 - Conditional**

The root `lint`, `format`, and `format:check` commands are stable delegators, but no package
currently implements their contracts. Before the first public release or an externally supported
contribution workflow, select either repository-owned checks or a replaceable external tool and
activate the non-mutating checks in `pnpm check`.

The implementation should enforce objective source invariants without duplicating TypeScript,
architecture, documentation, or human prose review. Any external tool must remain an exact,
development-only dependency behind the existing root commands.

The accepted replacement boundary is defined by
[Repository Tooling](tooling/index.md).

## Project-centred documentation consolidation

Importance: **P3 - Finalisation**

Perform this as the final project-wide step before beginning the deferred Lilium adapter.
Architecture, collection, decision, and governance documents remain useful while Aster is
establishing package boundaries and product guarantees. Package documentation should continue to
be the detailed source of truth for what each package does independently, how its features work,
and how packages compose without duplicating related material.

After the CLI boundary, Core and SVG hardening, Import hosting, and any retained parser work are
stable:

- ensure every package and feature document reflects implemented behaviour and current ownership;
- create either `docs/en/project.md` or a small `docs/en/project/` composition;
- summarise the product manifest, architecture, package relationships, and most important
  guarantees at project level;
- audit `architecture/`, `collections/`, `decisions/`, and `governance/` rather than preserving
  their files ceremonially;
- retain specialised documents only when their unique detail remains materially useful;
- migrate active guarantees and valuable rationale before deleting or merging obsolete documents;
- replace repeated explanations with links to package or project authorities;
- preserve collection provenance, licensing, compatibility guarantees, and rationale that still
  governs observable behaviour.

The result should make project-level documentation concise while allowing package documentation
to speak for the implementation. The current hierarchy and non-duplication rules remain defined
by the [Documentation Policy](governance/documentation-policy.md) until consolidation is accepted.

## Lilium adapter

Importance: **P4 - Deferred**

Postpone the Lilium adapter until the preceding roadmap is resolved and documentation
consolidation is complete. The adapter should begin only when portable Core contracts, rendering
semantics, package exports, and relevant catalogue or generation boundaries are stable enough to
avoid framework-driven changes leaking back into foundation packages.

The eventual adapter remains optional and directionally dependent on public Aster and Lilium
contracts. Aster Core, Icons, SVG, CLI, Lotus, and unrelated consumers must remain usable without
Lilium.
