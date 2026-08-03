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
| 2 | `P0` | Audit and harden `@aster/core` and `@aster/svg`. | Public APIs, correctness, performance evidence, exports, and conformance risks have explicit outcomes. |
| 3 | `P1` | Implement useful catalogue and TypeScript-first CLI workflows. | Users can inspect and consume installed icons and collections without requiring `@aster/build`. |
| 4 | `P0` | Evaluate the future of `@aster/build`. | Retain, narrow, pause, replace, or remove it using real SVG-import evidence. |
| 5 | `P1` | Harden the retained Build boundary, if any. | A real import workflow validates its parser, diagnostics, normalisation, generation, and host split. |
| 6 | `P2` | Consider an Aster-owned XML tokeniser. | Build is retained and parser conformance and maintenance evidence justify replacement. |
| 7 | `P2` | Activate objective linting and formatting verification. | The first supported release or external contribution workflow requires enforceable source checks. |
| 8 | `P3` | Consolidate project documentation. | Package documentation is self-contained and all preceding package decisions are stable. |
| 9 | `P4` | Begin the Lilium adapter. | Core and renderer contracts are stable and documentation consolidation is complete. |

## Plugin-compatible Aster CLI

Importance: **P0 - Required**

The initial command and host separation is accepted by the
[Command-line Boundary](architecture/command-line-boundary.md). Implementation and conformance
remain pending until the package exists.

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

Plugin compatibility must work in both directions without dependency inversion. A generic host
may load Aster commands as one plugin alongside commands from other ecosystems. The standalone
Aster CLI may eventually load explicitly compatible catalogue or target plugins, but Aster Core,
Icons, SVG, Lotus, Lilium, and unrelated projects must never depend on the CLI.

## Catalogue and command capabilities

Importance: **P1 - High**

The first useful commands should operate on explicitly installed or configured catalogue
providers and canonical TypeScript definitions. They do not require the SVG importer in
`@aster/build`.

| Command family | Initial responsibility | Build dependency |
| --- | --- | --- |
| `list` | List available catalogue providers, collections, or icons. | None. |
| `search` | Match canonical identity, display name, intrinsic tags, and explicit catalogue indexes. | None. |
| `show` | Display one icon or collection identity, metadata, membership, and available targets. | None. |
| `add` | Integrate selected definitions into a consumer project through an explicit package, import, or vendoring policy. | None initially. |
| `export` | Render one icon, an explicit selected set, or one collection to an explicit target output root. | None for TypeScript-first definitions. |
| `generate` | Produce explicitly selected manifests, barrels, wrappers, or target integrations through an installed generator. | None unless the selected generator imports SVG. |
| `import` | Convert external SVG and metadata into reviewed portable definitions. | Conditional on retained Build support. |

`add`, `export`, and `generate` must remain distinct. `add` changes consumer integration,
`export` produces target artefacts such as SVG files, and `generate` produces code or integration
artefacts. No command may silently copy source, install dependencies, overwrite user files, or
infer ownership from a directory name.

CLI discovery must not introduce a runtime global registry. Catalogue providers should supply
explicit manifests or indexes outside `IconDefinition`; collections continue to own only their
explicit membership. Search aliases, collection-specific categories, package provenance, and
computed indexes remain catalogue concerns rather than portable icon metadata.

The initial CLI should support deterministic machine-readable output in addition to human terminal
formatting. Command failures should return structured Aster-owned results; only the executable
shell maps them to stderr and process exit status.

## Core and SVG hardening

Importance: **P0 - Required**

Audit `@aster/core` and `@aster/svg` before broad CLI or adapter adoption. Improvements should be
evidence-led and preserve their host-independent production boundaries.

The Core audit should cover:

- API completeness and consistency across `Icon` and `Collection`;
- exact validation, canonicalisation, isolation, deep immutability, and deterministic errors;
- identity, metadata, tags, replacement relationships, and many-to-many membership invariants;
- allocations and repeated deep-validation costs measured with representative definitions;
- side-effect-free ESM, declaration quality, bundle shape, tree shaking, and public export control;
- extension pressure demonstrated by catalogues, CLI commands, target renderers, or adapters.

The SVG audit should cover:

- serialisation throughput and allocation profiles measured before optimisation;
- option normalisation, presentation precedence, escaping, accessibility, direction, and atomic
  failure behaviour;
- deterministic byte output and compatibility fixtures across representative definitions;
- whether batch export needs a host-level composition without adding filesystem, process, DOM, or
  catalogue authority to the renderer;
- API additions only when a real target consumer cannot express its workflow through
  `Svg.render()`.

Do not add caching, registries, streaming, mutable singletons, alternate builds, or convenience
facades without measured benefit and explicit ownership. Performance work must include repeatable
benchmarks and must not weaken correctness or portability.

## Build viability decision

Importance: **P0 - Required**

`@aster/build` currently provides a functioning optional SVG plus JSON import domain. It is not
required for TypeScript-first icon authoring, catalogue browsing, search, Core construction, SVG
rendering, or initial CLI export.

Before investing further, evaluate it against real workflows:

- importing third-party or vector-tool SVG artwork;
- supporting an intentionally SVG-first collection;
- preserving source locations and stable diagnostics that a simpler importer cannot provide;
- normalising accepted SVG into reviewable portable definitions;
- generating deterministic package text without acquiring filesystem authority.

Retain and harden Build only if at least one workflow benefits materially from those capabilities.
Narrow or pause it if only a subset is useful. Remove it from the active workspace if no real
consumer justifies its parser, metadata, validation, and generator maintenance cost. Existing
conformance evidence and accepted product guarantees must be migrated or explicitly retired before
removal.

The CLI must not force the decision. Build may power a future `import` command, but catalogue,
search, add, TypeScript-first export, and most generation commands should remain independently
usable.

## Build hardening, if retained

Importance: **P1 - High**

A retained Build package should be reviewed for API and internal boundaries, duplicated
authorities, performance, diagnostics, parser safety, metadata composition, normalisation,
generation ownership, and stale-file planning. The first production host should remain outside
Build and should prove atomic source acquisition and output commit through explicit contracts.

Do not expose Build merely because the CLI needs one command. The CLI should adapt the narrowest
host-independent Build composition, while source discovery, byte decoding, terminal presentation,
filesystem writes, and process status remain host responsibilities.

## Aster-owned XML tokeniser

Importance: **P2 - Conditional**

Consider replacing `xmlsax-typescript` only after Build is retained and hardened. Replacement is
worthwhile only when dependency maintenance, security, performance, source-location precision,
or grammar control provides concrete evidence that the existing adapter is insufficient.

Parser conformance fixtures must first cover the accepted SVG subset, rejected XML capabilities,
safety limits, inert sections, namespace handling, malformed input, and exact source spans. At
that point Aster may own runtime token discriminators rather than mirroring an external ABI, while
the syntax document and downstream pipeline contracts remain unchanged.

If Build is paused or removed, do not create a standalone XML tokeniser without an independent
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
[Workspace and Tooling](governance/workspace-and-tooling.md).

## Project-centred documentation consolidation

Importance: **P3 - Finalisation**

Perform this as the final project-wide step before beginning the deferred Lilium adapter.
Architecture, collection, decision, and governance documents remain useful while Aster is
establishing package boundaries and product guarantees. Package documentation should continue to
be the detailed source of truth for what each package does independently, how its features work,
and how packages compose without duplicating related material.

After the CLI boundary, Core and SVG hardening, Build decision, and any retained parser work are
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
