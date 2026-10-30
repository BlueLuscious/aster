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
| `P4 - Deferred` | Explicitly postponed work with no current implementation commitment. |

Priority expresses importance rather than implementation order. A capability still waits for its
stated prerequisite and evidence even when it has a higher priority than unrelated work.

## Recommended sequence

Package labels follow the [current package guide](packages/index.md). The column identifies primary
participants, not every transitive dependency or a commitment to change each package. Proposed
packages and undecided hosts remain conditional; `None` identifies work outside runtime packages.

None of these proposals is an unconditional next delivery. The current
[Icons authoring workflow](packages/icons/workflow.md) supports continued icon and collection
work without them; real authoring needs can provide evidence for reconsidering a capability
rather than wait for speculative infrastructure.

| Order | Importance | Capability | Packages involved | Activation gate |
| --- | --- | --- | --- | --- |
| 1 | `P2` | Evaluate command-set extraction and Flora integration. | CLI; proposed `aster-commands` and `aster-flora`, integrating external Flora. | An independent Flora host exposes a stable plugin ABI and consumes Aster commands. |
| 2 | `P2` | Consider an Aster-owned XML tokeniser. | Import. | Retained Import usage exposes concrete parser maintenance or conformance pressure. |
| 3 | `P2` | Evaluate headless repository-tooling extraction. | None; repository tooling and a proposed shared tooling library. | A second repository needs the same host-neutral kernels with independent policies. |
| 4 | `P2` | Reconsider SVG-first Managed Mode. | Import, Icons; managed host to be defined. | Repeated external-source synchronisation proves one-shot adoption insufficient. |
| 5 | `P2` | Reconsider multi-target Export orchestration. | CLI, SVG; additional target and orchestration boundary to be defined. | A second real export target proves shared orchestration necessary. |
| 6 | `P2` | Consider generated target integrations. | Icons, the selected renderer/adapter and a proposed generated integration package. | Repeated consumer wrappers prove a separate collection-target package useful. |
| 7 | `P2` | Consider coexisting API versions within one package. | The affected package; no candidate selected. | A real consumer needs incompatible APIs together and package pinning or ordinary migration cannot satisfy that requirement. |
| 8 | `P2` | Consider an additional package registry. | Core, Icons, SVG and CLI, subject to the accepted publication scope. | A real consumer needs GitHub-hosted package installation and the extra ownership, authentication and release-maintenance costs are justified. |
| 9 | `P2` | Consider published release history through the CLI. | CLI. | Published npm versions and package-specific GitHub Releases have a validated mapping, and remote query and failure policies are accepted. |
| 10 | `P2` | Reconsider a persistent Review watch host. | CLI, Icons, SVG; repository tooling for continuous authoring if selected. | Repeated catalogue authoring proves that the supported static loop creates material delay; choose post-build refresh or continuous authoring explicitly. |
| 11 | `P2` | Consider hosting the retained Import boundary. | Import; CLI if selected as host. | One real workflow needs acquisition, metadata review, diagnostics and persistence together, with an accepted host and distribution boundary. |
| 12 | `P2` | Reconsider catalogue and command expansion. | CLI; Icons and Import according to the workflow. | A real consumer and an accepted integration or generation policy justify one command independently of deferred families. |
| 13 | `P4` | Begin the Lilium adapter. | Core and a proposed adapter, integrating external Lilium. | Stable Aster and Lilium contracts support one proven integration boundary. |
| 14 | `P4` | Consider `@luscious-garden/aster-studio` with Lilium. | Core, Icons, SVG, Import and proposed `aster-studio`, integrating external Lilium. | A stable Lilium browser target and sustained visual-authoring needs justify an interactive application. |
| 15 | `P4` | Consider Garden documentation automation. | None; Aster/Garden documentation automation. | Repeated cross-repository drift proves that manually reviewed updates no longer scale. |
| 16 | `P4` | Consider a reusable versioning library. | None currently; release tooling would consume the proposed library. | Several independent projects demonstrate shared versioning needs and justify predefined or customisable policies. |
| 17 | `P4` | Reconsider selective Icons acquisition. | CLI, Icons. | A real consumer demonstrates a material need for selective acquisition or editable local sources; registry, integrity, ownership and update policies are accepted before implementation. |

## Command-set extraction and Flora integration

Importance: **P2 - Conditional**

The current CLI keeps host-neutral command composition separate from its private standalone shell.
Do not create `@luscious-garden/aster-commands` merely to reorganise files. Extract it only when an independent
consumer needs the same structured commands without the Aster executable.

Flora is the prospective headless multi-ecosystem CLI host. If Flora exposes a stable minimal
plugin ABI and one real integration scenario, an optional `@luscious-garden/aster-flora` adapter may translate
Flora invocations and capabilities to the extracted Aster command set:

```text
@luscious-garden/aster-core <- @luscious-garden/aster-svg <- @luscious-garden/aster-commands
                              ^           ^
                              |           |
                         @luscious-garden/aster-cli   @luscious-garden/aster-flora -> Flora runtime
                              |
                         @luscious-garden/aster-icons
```

`@luscious-garden/aster-commands` would own host-neutral validation, catalogue selection, and immutable target
plans. `@luscious-garden/aster-cli` would remain the standalone Node executable and compose the default Icons
catalogue. `@luscious-garden/aster-flora` would contain only the optional plugin adaptation. Flora would route an
explicit Aster namespace without making Aster packages depend on a generic ecosystem host.

Target plans remain effect-free; either standalone CLI capabilities or Flora capabilities decide
how to present and publish them. Aster Core, Icons, SVG, Protea, Lilium, and unrelated consumers
must not acquire reverse dependencies through this integration.

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

Core definitions can render to SVG through `@luscious-garden/aster-svg`, and CLI can plan and publish SVG exports.
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

## Coexisting API versions

Importance: **P2 - Conditional**

The package's own Semantic Versioning identity already versions its exported APIs under the
[project versioning policy](project/versioning.md). Separate API versions such as `v1` and `v2`
inside one package are not required by the supported single-version API.

Consider versioned entrypoints or explicitly selected compatibility implementations only when a
real consumer needs incompatible API contracts simultaneously within one installed package and
ordinary package pinning or migration cannot satisfy that requirement. A breaking package release
alone does not justify retaining several API generations inside its replacement.

Before accepting coexistence, define selection semantics, supported version combinations,
compatibility evidence, maintenance ownership, migration and retirement rules, and distribution
costs. Do not add `/v1` imports, versioned classes, separate per-API counters or duplicated
implementations speculatively. Independent schema or protocol revisions identify their own format
or negotiation boundary and do not establish a need for coexisting package APIs.

## Additional package registry

Importance: **P2 - Conditional**

The [publication procedure](project/publication.md#distribution-channels) owns the accepted
distribution channels. An additional GitHub Packages registry is optional and does not justify
a speculative repository transfer or package rename.

Reconsider it only when a concrete consumer needs GitHub-hosted dependency installation rather
than a release page or downloadable archive. Before acceptance, verify the GitHub account or
organisation namespace independently from the npm scope, repository association, package
visibility, publisher permissions, and authentication requirements even for public consumers.
Define whether both registries receive identical approved archives, how dependency resolution and
dist-tags are verified, and how partial publication is recovered without silently rebuilding a
released version. See the [GitHub npm registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

No second-registry workflow, token, scope mapping or automatic publication is currently accepted.

## Published release history

Importance: **P2 - Conditional**

Consider an explicit remote command such as
`aster releases [core|icons|svg|cli]` for published package versions and their release details.
The plural name denotes a read-only query, not release preparation or publication. It must not
change the meaning or offline behaviour of local `aster version` requests.

The proposed data sources have separate responsibilities:

| Data | Authority |
| --- | --- |
| Published package versions, npm publication dates and dist-tags such as `latest` and `next`. | npm registry metadata. |
| Release title, published notes, GitHub publication date, links and asset metadata. | Public GitHub Releases API. |
| Package/version correspondence. | Exact package identity and the `<package>/v<version>` tag convention owned by [publication policy](project/publication.md#distribution-channels). |

Query npm first to establish published versions, then enrich matching records with GitHub data.
Use the published Release body for notes, not current Markdown from `master` or scraped website
HTML. Do not infer package membership from free-form titles or notes, conflate npm and GitHub
publication dates, or use GitHub's repository-wide Latest label as a per-package version selector.

Early release candidates have no companion GitHub Releases. A published version without matching
notes must retain that explicit absence rather than disappear or acquire invented details.
Validate the mapping before claiming a complete per-package history.

The proposed Node host acquires HTTP data directly, without requiring `gh` or spawning `npm view`.
Network effects stay outside host-neutral result processing. Public requests should not require
credentials; authentication and rate-limit handling still need an explicit policy.

Before implementation, define registry authority, pagination and response limits, timeouts,
cache/offline behaviour and partial-failure semantics. Distinguish unavailable GitHub enrichment
from an authoritative absence of notes. The command must not install or update packages, download
release assets implicitly, create tags or publish Releases. Until a real consumer justifies that
host boundary, use [npm's package metadata query](https://docs.npmjs.com/cli/v11/commands/npm-view/)
and the [GitHub Releases API](https://docs.github.com/en/rest/releases/releases) directly.

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

The proposed serving host uses Node's built-in `node:http`, bound to `127.0.0.1`, with a small
host-specific browser layer receiving server-sent events to reload a completed review. This needs
no CDN, external service, Vite, Express, Lilium or WebSocket dependency. Restrict HTTP routes to
the review and refresh protocol rather than expose a general filesystem server. Live-reload code
belongs only to the hosted session; ordinary static exports remain self-contained and script-free.

Choose the authoring scope explicitly:

| Scope | Proposed lifecycle |
| --- | --- |
| Post-build review watch. | The maintainer builds the catalogue; the host regenerates review and notifies the browser. |
| Continuous authoring. | A separate private tooling watcher observes authored sources, runs catalogue generation and compilation, then signals the review host after a successful build. |

The continuous-authoring loop is not implemented. It requires a separately owned build-completion
signal and source-watching lifecycle, not a compiler hidden inside the public CLI command:

```text
save .icon.ts -> private authoring watcher -> generate and compile catalogue
             -> successful build signal -> fresh catalogue process
             -> publish review -> notify browser
```

Any accepted host must establish all of these boundaries together:

- observe only a stable completion signal for built catalogue artefacts;
- acquire each refreshed catalogue through an isolated process or worker;
- reuse the existing review planner, serialiser, ownership marker, and safe replacement rules;
- bind only to a loopback interface and define deterministic port-selection behaviour;
- retain the last valid review on rebuild failure and report its stale state truthfully;
- own refresh signalling, recovery and cleanup of watchers, processes and connections on termination;
- keep browser launch optional and outside the programmatic command API;
- preserve static review as independently usable and avoid adding compilation or source discovery.

Prefer owned on-disk regeneration unless measured evidence proves that an in-memory document
lifecycle materially improves authoring without weakening publication ownership. Do not add a
general development server or framework dependency solely for this capability.

## Import host integration

Importance: **P2 - Conditional**

The private [Import package](packages/import/index.md) owns hardened source inspection,
diagnostics, parser safety, normalisation, editable serialisation, caller isolation, and package
conformance. It deliberately owns no source discovery, filesystem, terminal, or process effects.

The conversion API already exists. This proposal adds a usable acquisition, review and persistence
workflow around it, not broader SVG acceptance, artistic refinement, collection admission or
continuous regeneration. Selecting a publicly distributed CLI host also requires an explicit
decision about the private Import package's distribution and dependencies.

Host integration begins only when one real workflow needs all of these capabilities together:

- explicit file or byte acquisition and text decoding;
- source identity and complete reviewed Core metadata collection;
- deterministic diagnostic presentation and rejection handling;
- user-confirmed output paths and atomic persistence;
- preservation of editable TypeScript as the final human-owned source.

The host should adapt the narrowest Import composition. Source discovery, byte decoding, terminal
presentation, filesystem writes, and process status remain host responsibilities. Catalogue
discovery, TypeScript-first export, and rendering must remain usable without Import.

## Catalogue and command expansion

Importance: **P2 - Conditional**

The implemented `@luscious-garden/aster-cli` already provides catalogue discovery, lookup, search, display,
deterministic SVG export, and disposable static review publication through host-neutral commands
and a standalone Node shell. Those current guarantees are documented by the
[CLI package](packages/cli/index.md).

This is a conditional grouping, not a delivery to implement every command family together.
The remaining command families require independent consumer policies:

| Command family | Proposed responsibility | Activation evidence |
| --- | --- | --- |
| `add` | Integrate selected definitions through an explicit package, import, or vendoring policy. | One supported consumer-project strategy with conflict and ownership rules. |
| `generate` | Produce selected manifests, barrels, wrappers, or target integrations. | One concrete generated target with canonical ownership and cleanup rules. |
| `import` | Host external-source acquisition, reviewed Core metadata, adoption, and persistence. | The complete [Import host boundary](#import-host-integration). |

These commands remain distinct. `add` changes consumer integration, `generate` creates code or
integration artefacts, and `import` adopts external artwork. Implemented `review` creates
disposable evidence and remains separate from every persistent source workflow.
These families do not activate the separately deferred [selective Icons acquisition](#selective-icons-acquisition).
No command may silently install dependencies, overwrite files, infer ownership from a directory
name, or move filesystem authority into a host-neutral command.

## Lilium adapter

Importance: **P4 - Deferred**

Begin the Lilium adapter only when portable Core contracts, rendering semantics, package exports,
and the relevant catalogue or generation boundaries are stable against the public Lilium APIs
required by one real integration.

The adapter remains optional and directionally dependent on public Aster and Lilium contracts.
Aster Core, Icons, SVG, CLI, Protea, and unrelated consumers remain usable without Lilium. DOM
implementation, if required, belongs to an optional target mapping rather than the portable Aster
definition boundary.

## Aster Studio

Importance: **P4 - Deferred**

`@luscious-garden/aster-studio` is a provisional name for a future Lilium web application dedicated to interactive
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

## Reusable versioning library

Importance: **P4 - Deferred**

Consider an independent development library only when several projects demonstrate shared
versioning needs. Predefined or customisable policies could calculate independent package
increments and dependency consequences from explicitly classified changes. Compatibility must
not be inferred solely from commit titles; version proposals still require human review.

Keep calculation separate from Git, registry and publication effects. Aster could consume the
library as a `devDependency`, never a production dependency. Do not build a general framework or
an Aster-only versioning assistant for this one repository. Manual assessment under the
[versioning policy](project/versioning.md) remains sufficient; this proposal is not a release
prerequisite and authorises no library implementation or automatic publication.

## Selective Icons acquisition

Importance: **P4 - Deferred; last in the recommended sequence**

Implementation is deferred until a real consumer demonstrates that full-package acquisition or
the lack of a supported editable-source workflow creates a material problem. There is no current
delivery commitment; this capability is not a prerequisite for current Icons use or independent
work on other capabilities.

If that need is established, reconsider acquiring one icon, one variant or one collection without
installing the complete `@luscious-garden/aster-icons` artefact. A possible design is a defined
Aster registry consumed by explicit CLI workflows; these command examples remain proposals:

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

Stable local Icons manifests, identity rules and dynamic loading are necessary foundations, not
an activation trigger on their own. Before implementation, the design must establish:

- registry ownership, schema versioning, availability and trust boundaries;
- artefact integrity, provenance, licensing and attribution;
- collection membership closure and shared-icon deduplication;
- destination ownership, conflict, update and removal semantics;
- offline, cached and failed-acquisition behaviour;
- the distinction between vendored editable source and installed immutable dependencies.

### Collection package boundary

Collections remain inside `@luscious-garden/aster-icons` while they share definition ownership, release maturity
and dependencies. Creating one `@luscious-garden/aster-collections` package that depends on `@luscious-garden/aster-icons` would
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
direction. Without a demonstrated trigger, retain collections inside `@luscious-garden/aster-icons`
and treat their isolated subpaths as the supported boundary.
