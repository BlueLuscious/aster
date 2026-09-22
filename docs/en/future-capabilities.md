# Future Capabilities

Status: **Proposed**

This document records prioritised opportunities that are not current product guarantees. Each
capability remains optional until its evidence trigger is met and any material public, package, or
dependency boundary is accepted separately. Implemented behaviour belongs to the owning package,
tooling, collection, or [project documentation](project/index.md), not to this roadmap.

## Importance levels

| Level | Meaning |
| --- | --- |
| `P0 - Required` | Must be resolved before Aster expands the affected supported surface. |
| `P1 - High` | Provides substantial user or maintenance value after its foundations are stable. |
| `P2 - Conditional` | Proceeds only when measured evidence or a real consumer justifies it. |
| `P4 - Deferred` | Explicitly postponed integration work with no current implementation commitment. |

Priority expresses importance rather than implementation order. A capability still waits for its
stated prerequisite and evidence even when it has a higher priority than unrelated work.

## Recommended sequence

| Order | Importance | Capability | Activation gate |
| --- | --- | --- | --- |
| 1 | `P0` | Complete first supported pre-release readiness. | The selected public package set passes every release, distribution, documentation and source-quality gate. |
| 2 | `P2` | Add informational SVG attribution markers. | Release-readiness work is complete and the renderer's default-versus-opt-in output policy is accepted. |
| 3 | `P1` | Deliver selective Icons acquisition. | Stable manifests and an accepted registry, integrity, ownership and update policy exist. |
| 4 | `P2` | Automate reviewed version proposals. | One manually reviewed multi-package release proves the version and changelog policy. |
| 5 | `P1` | Host the retained Import boundary. | One real workflow needs acquisition, metadata review, diagnostics and persistence together. |
| 6 | `P1` | Expand catalogue and command workflows. | One explicit consumer policy exists for each accepted command. |
| 7 | `P2` | Reconsider a persistent Review watch host. | Repeated catalogue authoring proves that the supported static loop creates material delay. |
| 8 | `P2` | Evaluate command-set extraction and Flora integration. | An independent Flora host exposes a stable plugin ABI and consumes Aster commands. |
| 9 | `P2` | Consider an Aster-owned XML tokeniser. | Retained Import usage exposes concrete parser maintenance or conformance pressure. |
| 10 | `P2` | Evaluate headless repository-tooling extraction. | A second repository needs the same host-neutral kernels with independent policies. |
| 11 | `P2` | Reconsider SVG-first Managed Mode. | Repeated external-source synchronisation proves one-shot adoption insufficient. |
| 12 | `P2` | Reconsider multi-target Export orchestration. | A second real export target proves shared orchestration necessary. |
| 13 | `P2` | Consider generated target integrations. | Repeated consumer wrappers prove a separate collection-target package useful. |
| 14 | `P4` | Begin the Lilium adapter. | Stable Aster and Lilium contracts support one proven integration boundary. |
| 15 | `P4` | Consider `@aster/studio` with Lilium. | A stable Lilium browser target and sustained visual-authoring needs justify an interactive application. |
| 16 | `P4` | Consider Garden documentation automation. | Repeated cross-repository drift proves that manually reviewed updates no longer scale. |

## First supported pre-release readiness

Importance: **P0 - Required**

Aster's immediate delivery gate is its first supported pre-release. This work does not expand the
product model: it proves that the selected public packages can be installed, understood, and
released without relying on workspace internals or undocumented maintainer knowledge.

Readiness must establish:

- the exact published package set, initial versions, dependency ranges, and release order;
- complete package metadata, software and artwork licensing, attribution, and provenance;
- reproducible package archives, clean-consumer installation, public export and declaration
  conformance, and package-content review;
- objective non-mutating ESLint and Prettier checks, limited to rules not already enforced by
  TypeScript or existing repository verifiers, integrated into repository verification;
- installation, quick-start, compatibility, and release documentation for supported consumers;
- release notes and an explicit npm publication procedure with least-privilege credentials,
  protected environments, and a deliberate human release action.

`@aster/import` remains private unless a separate hosted workflow and publication decision justify
it. Selective registry acquisition, Flora, Lilium, Studio, Managed Mode, and multi-target Export
are not prerequisites for the first supported pre-release.

After publication, durable release guarantees belong to project, package, collection, and tooling
documentation. Remove this temporary roadmap gate rather than preserving a completed release
checklist as a future capability.

## Informational SVG attribution markers

Importance: **P2 - Conditional**

After the current release-readiness work, consider placing `data-attribution` and
`data-rendered-by="Aster"` on rendered SVG roots. Attribution must come from the individual icon's
metadata rather than the collection or a hard-coded author. Decide whether the markers belong to
every `Svg.render(...)` result or an explicit SVG export mode before changing the public output
contract. A missing attribution must not be invented.

These markers make source provenance easier to inspect but do not enforce ownership or replace
the accompanying licence and credits. Anyone who controls an SVG file can remove them, and
optimisation may discard non-visual attributes. If accepted, update exact SVG and CLI output
evidence, package documentation, and packed-consumer tests, then repeat release conformance
before publication. Do not add a watermark or a runtime dependency for this purpose.

## Reviewed version proposals

Importance: **P2 - Conditional**

After the first manually reviewed release establishes real package version and changelog evidence,
consider automating proposals from conventional commits and public-contract changes. A proposal
must identify the affected packages, dependency-range consequences and compatibility rationale;
commit scopes alone do not determine a version increment. Release notes and package versions
remain independently reviewable, and npm publication always requires explicit human approval.

This is a near-term follow-up to a proven manual release process, not a prerequisite for the
first pre-release and not a reason to introduce a release framework prematurely.

## Catalogue and command expansion

Importance: **P1 - High**

The implemented `@aster/cli` already provides catalogue discovery, lookup, search, display,
deterministic SVG export, and disposable static review publication through host-neutral commands
and a standalone Node shell. Those current guarantees are documented by the
[CLI package](packages/cli/index.md).

The remaining command families require independent consumer policies:

| Command family | Proposed responsibility | Activation evidence |
| --- | --- | --- |
| `add` | Integrate selected definitions through an explicit package, import, or vendoring policy. | One supported consumer-project strategy with conflict and ownership rules. |
| `generate` | Produce selected manifests, barrels, wrappers, or target integrations. | One concrete generated target with canonical ownership and cleanup rules. |
| `import` | Host external-source acquisition, reviewed Core metadata, adoption, and persistence. | The complete Import host boundary described below. |

These commands remain distinct. `add` changes consumer integration, `generate` creates code or
integration artefacts, and `import` adopts external artwork. Implemented `review` creates
disposable evidence and remains separate from every persistent source workflow.
No command may silently install dependencies, overwrite files, infer ownership from a directory
name, or move filesystem authority into a host-neutral command.

## Review watch host

Importance: **P2 - Conditional**

The implemented `aster review` workflow deliberately publishes a finite, self-contained HTML
document and terminates. Its static lifecycle is the complete supported contract; `--watch` is not
an accepted option and no browser, server, source watcher, or TypeScript compiler belongs to the
headless command kernel.

Reconsider a persistent watch host only when repeated real icon or collection authoring shows that
building the catalogue, replacing the owned review output, and refreshing it manually creates a
material delay. Convenience alone is insufficient because ESM package reloads require more than a
cache-busting root import: statically imported descendants can otherwise remain stale.

Any accepted host must establish all of these boundaries together:

- observe only a stable completion signal for built catalogue artefacts;
- acquire each refreshed catalogue through an isolated process or worker;
- reuse the existing review planner, serialiser, ownership marker, and safe replacement rules;
- bind only to a loopback interface and define deterministic port-selection behaviour;
- own refresh signalling, rebuild-failure recovery, termination, and resource cleanup;
- keep browser launch optional and outside the programmatic command API;
- preserve static review as independently usable and avoid adding compilation or source discovery.

Prefer owned on-disk regeneration unless measured evidence proves that an in-memory document
lifecycle materially improves authoring without weakening publication ownership. Do not add a
general development server or framework dependency solely for this capability.

## Selective Icons acquisition

Importance: **P1 - High**

Consumers must eventually be able to acquire one icon, one variant or one collection without
installing the complete `@aster/icons` artefact. The preferred direction is a defined Aster
registry consumed by explicit CLI workflows:

```text
aster add icon camera
aster add icon camera --variant stippled
aster add collection amellus
```

The registry should expose lightweight searchable metadata and immutable artefacts addressable by
canonical identity and version. The CLI should resolve requested dependencies, verify integrity
and provenance, detect ownership and conflicts, and materialise only the accepted files. Updates
and removals require equally explicit policies; `add` must never silently overwrite human-owned
sources or install ambient dependencies.

This capability starts only after local Icons manifests, identity rules and dynamic loading are
stable. Its design must establish:

- registry ownership, schema versioning, availability and trust boundaries;
- artefact integrity, provenance, licensing and attribution;
- collection membership closure and shared-icon deduplication;
- destination ownership, conflict, update and removal semantics;
- offline, cached and failed-acquisition behaviour;
- the distinction between vendored editable source and installed immutable dependencies.

### Collection package boundary

Collections remain inside `@aster/icons` while they share definition ownership, release maturity
and dependencies. Creating one `@aster/collections` package that depends on `@aster/icons` would
not reduce npm acquisition because its dependency would still install the complete Icons package.
Do not introduce it merely to mirror a source directory.

Independently versioned packages per collection may later complement registry acquisition for
consumers that prefer conventional npm dependencies. Adopt that model only when packed size,
installation cost, release cadence, licensing or real consumer demand justifies the publication
overhead. Shared icons must retain one canonical owner rather than being copied into several
collection packages.

Reconsider a separate collection boundary when at least one of these conditions is observed:

- collections require an independent release cadence or compatibility policy;
- collection metadata, licensing, curation or tooling gains distinct ownership;
- consumers commonly acquire or discover collections independently from the full icon package;
- another icon-definition provider must publish collections through the same boundary;
- measured package composition proves that a separate dependency graph improves real consumers.

If accepted, migration requires an explicit compatibility period and an acyclic dependency
direction. If no trigger appears before the first supported release, retain collections inside
`@aster/icons` and treat their isolated subpaths as the supported boundary.

## Command-set extraction and Flora integration

Importance: **P2 - Conditional**

The current CLI keeps host-neutral command composition separate from its private standalone shell.
Do not create `@aster/commands` merely to reorganise files. Extract it only when an independent
consumer needs the same structured commands without the Aster executable.

Flora is the prospective headless multi-ecosystem CLI host. If Flora exposes a stable minimal
plugin ABI and one real integration scenario, an optional `@aster/flora` adapter may translate
Flora invocations and capabilities to the extracted Aster command set:

```text
@aster/core <- @aster/svg <- @aster/commands
                              ^           ^
                              |           |
                         @aster/cli   @aster/flora -> @flora/core
                              |
                         @aster/icons
```

`@aster/commands` would own host-neutral validation, catalogue selection, and immutable target
plans. `@aster/cli` would remain the standalone Node executable and compose the default Icons
catalogue. `@aster/flora` would contain only the optional plugin adaptation. Flora would route an
explicit Aster namespace without making Aster packages depend on a generic ecosystem host.

Target plans remain effect-free; either standalone CLI capabilities or Flora capabilities decide
how to present and publish them. Aster Core, Icons, SVG, Protea, Lilium, and unrelated consumers
must not acquire reverse dependencies through this integration.

## Import host integration

Importance: **P1 - High**

The private [Import package](packages/import/index.md) owns hardened source inspection,
diagnostics, parser safety, normalisation, editable serialisation, caller isolation, and package
conformance. It deliberately owns no source discovery, filesystem, terminal, or process effects.

Host integration begins only when one real workflow needs all of these capabilities together:

- explicit file or byte acquisition and text decoding;
- source identity and complete reviewed Core metadata collection;
- deterministic diagnostic presentation and rejection handling;
- user-confirmed output paths and atomic persistence;
- preservation of editable TypeScript as the final human-owned source.

The host should adapt the narrowest Import composition. Source discovery, byte decoding, terminal
presentation, filesystem writes, and process status remain host responsibilities. Catalogue
discovery, TypeScript-first export, and rendering must remain usable without Import.

## SVG-first Managed Mode

Importance: **P2 - Conditional**

Managed Mode remains outside the active product path. Reconsider it only when one real collection
must keep SVG or another external format canonical across repeated regeneration and demonstrates
that one-shot adoption creates material maintenance cost.

That trigger must define source ownership, metadata ownership, overwrite policy, stale cleanup,
conflict handling, deterministic regeneration, and human-edit boundaries together. Do not add any
of those guarantees incrementally to Import.

## Multi-target Export orchestration

Importance: **P2 - Conditional**

Core definitions can render to SVG through `@aster/svg`, and CLI can plan and publish SVG exports.
Introduce a separate multi-target Export boundary only after a second real target, such as JSON,
proves that shared target selection, diagnostics, or atomic planning cannot remain in its owning
adapter or host.

Import must not absorb the reverse direction merely because it emits editable TypeScript.
Adoption and export have different trust, ownership, and lifecycle boundaries.

## Generated target integrations

Importance: **P2 - Conditional**

A generic renderer or framework adapter does not own a collection and therefore does not re-export
collection definitions. Consider a generated collection-target package only when real consumers
repeatedly need named wrappers that combine one existing collection with one existing target.

Each generated wrapper would import exactly one portable definition through its public subpath,
delegate unchanged options to the generic target, and contain no copied geometry or target logic.
An optional wrapper may re-export the same definition object, but it cannot reconstruct or decorate
it. Per-icon imports must remain isolated from unrelated definitions and collection aggregates.

Do not create these packages before their generic target and collection are independently stable,
and do not make Core, a renderer, or a collection depend on the generated integration.

## Aster-owned XML tokeniser

Importance: **P2 - Conditional**

Consider replacing `xmlsax-typescript` only after Import has a real host and retained usage
provides evidence that dependency maintenance, security, performance, source-location precision,
or grammar control is insufficient.

Parser conformance must first cover the accepted SVG subset, rejected XML capabilities, safety
limits, inert sections, namespace handling, malformed input, and exact source spans. Aster may
then own runtime token discriminators without changing the downstream syntax and adoption
contracts. Do not create a standalone tokeniser without measured Import evidence or another
independent consumer.

The replaceable dependency boundary remains defined by the
[Import SVG parser](packages/import/formats/svg/parser/index.md) and
[Import compatibility](packages/import/compatibility.md) authorities.

## Headless repository-tooling extraction

Importance: **P2 - Conditional**

The hardened tooling structure permits a future independent headless project, but extraction
requires a second real repository consumer. Candidate portable capabilities include verifier
orchestration, issue collection, filesystem and path contracts, deterministic traversal, strict
JSON acquisition, benchmark execution, and sample aggregation.

Repository policy is not automatically portable. Aster-specific package identities, dependency
allowlists, compiler requirements, documentation hierarchy, parser ownership, cleanup boundaries,
and package performance scenarios remain Aster-owned policies or explicit adapters.

An independent project should expose host-neutral kernels and a small explicit policy-composition
boundary. Aster would consume it only as development tooling and retain thin process entrypoints.
Do not extract by copying every verifier, introducing automatic rule discovery or mutable global
registries, or combining contributor tooling with the user-facing multi-ecosystem CLI.

## Aster Studio

Importance: **P4 - Deferred**

`@aster/studio` is a provisional name for a future Lilium web application dedicated to interactive
Aster authoring. It is not a current package boundary, release prerequisite, or reason for Core,
Icons, SVG, Import, or CLI to depend on Lilium. A broader Garden workbench may eventually host the
same Aster experience, but cross-project composition must not move Aster domain behaviour into an
unrelated product.

The proposed application would maintain one explicit mutable authoring draft and project it into:

- an interactive vector canvas with selectable nodes, points, snapping, grid, and safe-area guides;
- a numeric inspector for geometry, presentation, identity, metadata, and tags;
- live TypeScript and SVG representations;
- explicit TypeScript and SVG import, copy, download, and export operations;
- standalone-icon and collection-member modes with collection-owned authoring constraints.

The draft, rather than the canvas or either text representation, should remain the editing
authority. Visual changes may regenerate TypeScript and SVG immediately. Applying edited SVG may
use the explicit Import boundary, while editable TypeScript requires a finite accepted authoring
grammar and must never execute arbitrary source. Invalid text should preserve the last valid draft
and expose diagnostics rather than partially changing geometry.

Collection grid, safe-area, and view-box constraints require an authoring-profile decision based
on real collection work. They must not be added to portable `CollectionDefinition` merely to serve
one editor. Member editing may lock strict collection values, while editing the collection profile
itself remains a separate higher-authority operation.

Begin Studio only after static `aster review` evidence and sustained manual authoring demonstrate
which interactive operations, history, parsing, and persistence boundaries are actually needed.
Extract a headless authoring package only if the application reveals reusable draft, command,
diagnostic, serialisation, or undo contracts independent from its Lilium UI.

## Lilium adapter

Importance: **P4 - Deferred**

Begin the Lilium adapter only when portable Core contracts, rendering semantics, package exports,
and the relevant catalogue or generation boundaries are stable against the public Lilium APIs
required by one real integration.

The adapter remains optional and directionally dependent on public Aster and Lilium contracts.
Aster Core, Icons, SVG, CLI, Protea, and unrelated consumers remain usable without Lilium. DOM
implementation, if required, belongs to an optional target mapping rather than the portable Aster
definition boundary.

## Garden documentation automation

Importance: **P4 - Deferred**

Cross-repository documentation updates between Aster and Garden remain manual, independently
reviewed pull requests. Aster must not push to Garden, synchronise prose, or make either repository
part of the other's build, test, release, or source checkout.

Reconsider limited automation only after repeated real maintenance demonstrates material drift or
missed ecosystem updates. Acceptable candidates are:

- Garden-owned scheduled validation of external links;
- an Aster release event that proposes a Garden issue without editing documentation;
- a bot-authored pull request derived from an accepted versioned metadata contract and requiring
  human Garden review.

Do not introduce submodules, direct cross-repository writes, shared mutable documentation, or
credentials broader than one narrowly scoped GitHub App. Automation must preserve Garden's
authority over ecosystem prose and Aster's authority over its implementation documentation.
