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
| 1 | `P1` | Host the retained Import boundary. | One real workflow needs acquisition, metadata review, diagnostics, and persistence together. |
| 2 | `P1` | Expand catalogue and command workflows. | One explicit consumer policy exists for each accepted command. |
| 3 | `P2` | Evaluate selective Icons acquisition. | Measured package acquisition cost or consumer demand justifies a distribution product beyond subpath imports. |
| 4 | `P2` | Evaluate command-set extraction and Flora integration. | An independent Flora host exposes a stable plugin ABI and consumes Aster commands. |
| 5 | `P2` | Consider an Aster-owned XML tokeniser. | Retained Import usage exposes concrete parser maintenance or conformance pressure. |
| 6 | `P2` | Activate objective linting and formatting verification. | A supported release or external contribution workflow requires enforceable source checks. |
| 7 | `P2` | Evaluate headless repository-tooling extraction. | A second repository needs the same host-neutral kernels with independent policies. |
| 8 | `P2` | Reconsider SVG-first Managed Mode. | Repeated external-source synchronisation proves one-shot adoption insufficient. |
| 9 | `P2` | Reconsider multi-target Export orchestration. | A second real export target proves shared orchestration necessary. |
| 10 | `P2` | Consider generated target integrations. | Repeated consumer wrappers prove a separate collection-target package useful. |
| 11 | `P4` | Begin the Lilium adapter. | Stable Aster and Lilium contracts support one proven integration boundary. |
| 12 | `P4` | Consider `@aster/studio` with Lilium. | A stable Lilium browser target and sustained visual-authoring needs justify an interactive application. |

## Catalogue and command expansion

Importance: **P1 - High**

The implemented `@aster/cli` already provides catalogue discovery, lookup, search, display, and
deterministic SVG export through host-neutral commands and a standalone Node shell. Those current
guarantees are documented by the [CLI package](packages/cli/index.md).

The remaining command families require independent consumer policies:

| Command family | Proposed responsibility | Activation evidence |
| --- | --- | --- |
| `add` | Integrate selected definitions through an explicit package, import, or vendoring policy. | One supported consumer-project strategy with conflict and ownership rules. |
| `review` | Compose disposable technical and visual evidence through explicit render and output hosts. | One review format and lifecycle that adds value beyond tests and raw SVG export. |
| `generate` | Produce selected manifests, barrels, wrappers, or target integrations. | One concrete generated target with canonical ownership and cleanup rules. |
| `import` | Host external-source acquisition, reviewed Core metadata, adoption, and persistence. | The complete Import host boundary described below. |

These commands remain distinct. `add` changes consumer integration, `review` creates disposable
evidence, `generate` creates code or integration artefacts, and `import` adopts external artwork.
No command may silently install dependencies, overwrite files, infer ownership from a directory
name, or move filesystem authority into a host-neutral command.

## Selective Icons acquisition

Importance: **P2 - Conditional**

The implemented `@aster/icons` export map already separates scalable public families:

- `.` provides named icon definitions and the complete `AsterIcons` index;
- `./*` maps short isolated icon imports to canonical `*.icon` modules;
- `./collections` provides the complete `AsterCollections` family;
- `./collections/*` maps isolated collection imports to canonical `*.collection` modules.

These guarded pattern targets prevent manifest growth per definition while keeping constants,
implementation modules and physical source paths inaccessible. The root deliberately remains an
icon-only facade; complete collection discovery is opt-in.

Package exports and package acquisition are separate concerns. Subpath imports can prevent
unrelated modules from entering runtime evaluation or a consumer bundle, but installing one npm
package still acquires its complete tarball. Downloading only selected icons or one collection
requires a different distribution product, such as independently versioned collection packages or
an explicit `aster add` vendoring workflow backed by a defined source and ownership policy.

Do not split packages solely from an estimated future icon count. First measure packed size,
installation cost, bundle behaviour, collection overlap, versioning pressure, licensing boundaries
and real consumer demand. A collection-package model must resolve icons shared by several
collections without accidental duplicate ownership. Selective CLI acquisition must define source
integrity, provenance, updates, conflicts and removal before writing consumer files.

If manual index and barrel maintenance becomes error-prone, consider deterministic repository-time
generation from canonical icon modules. Generated indexes must retain a declared source of truth,
verification and cleanup boundary; runtime filesystem scanning remains prohibited.

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
how to present and publish them. Aster Core, Icons, SVG, Lotus, Lilium, and unrelated consumers
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

## Active linting and formatting verification

Importance: **P2 - Conditional**

The root `lint`, `format`, and `format:check` commands are stable delegators, but no package
currently implements their contracts. Before the first supported release or external
contribution workflow, select either repository-owned checks or a replaceable external tool and
activate non-mutating checks through the root verification path.

The implementation should enforce objective source invariants without duplicating TypeScript,
architecture, documentation, or human prose review. Any external tool remains an exact
development-only dependency behind the existing root commands. The replacement boundary belongs
to [Repository Tooling](tooling/index.md).

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
Aster Core, Icons, SVG, CLI, Lotus, and unrelated consumers remain usable without Lilium. DOM
implementation, if required, belongs to an optional target mapping rather than the portable Aster
definition boundary.
