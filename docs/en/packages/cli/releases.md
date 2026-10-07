# CLI Release Notes

## 0.1.0

Status: **Prepared in source; not yet published**.

The first stable CLI package retains the command behaviour accepted in `0.1.0-rc.3`; there is no
new command or migration from that candidate. The stable archive must declare runtime
dependencies on Core, Icons and SVG at `^0.1.0`. Consumers upgrading from earlier candidates
should review the version-source correction below. Registry links, archive hashes and the
publication date will be recorded after the exact stable archive is approved and published.

## 0.1.0-rc.3

Status: **Published on 7 October 2026** under the npm `next` tag.

Registry: [`@luscious-garden/aster-cli@0.1.0-rc.3`](https://www.npmjs.com/package/@luscious-garden/aster-cli/v/0.1.0-rc.3).
The approved archive hash and registry checks are recorded in the
[third candidate artefact evidence](../../project/publication.md#third-candidate-artefact).

**Breaking semantic correction:** `version core`, `version icons`, `version svg` and
`version --all` now inspect packages directly installed in the current project. The published
`0.1.0-rc.2` CLI instead reported packages resolved by its own installation. `version` and
`version cli` still report the executed CLI; `--all` no longer invents a project CLI when only
an external executable is available. Consumers relying on the earlier resolution source or
result set must update their expectations.

**Compatible capability:** `--deps` reports each selected root separately from its direct
installed Aster runtime dependencies. `version --deps` aliases `version cli --deps`;
`version --all --deps` retains separate project roots even when their Core copies differ.
Optional `--location` on executed-CLI queries reports the loaded module and its relationship to
the current project's direct CLI. See [CLI Shell](shell/index.md) for grammar and output.

The CLI release depends on Core, Icons and SVG `^0.1.0-rc.2`; those three published packages
remain at `0.1.0-rc.2` with no source changes. The published CLI `0.1.0-rc.2` archive is
immutable. The `rc.3` archive was built from the approved `master` commit and installed from npm
in an anonymous consumer.

## 0.1.0-rc.2

Status: **Published on 6 October 2026** under the npm `next` tag.

Registry: [`@luscious-garden/aster-cli@0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-cli/v/0.1.0-rc.2)

Approved archive SHA-256: `403e6882abb1b10bbd0d06ac9d355731898d4d4102b9f156a7c1d198968b27e2`.

**Breaking change:** Complete collection loaders now return the Core alias dictionary and its
derived `members` list. Providers using the previous icon array must construct their collection
through the matching `Collection.define()` implementation. Inconsistent keyed and ordered views
are rejected during Core revalidation before command plans become observable.

Metadata-only discovery retains its existing identity arrays. Catalogue identity selection and
ordered export and review results remain unchanged. This integration requires the corresponding
Core and Icons `0.1.0-rc.2` implementations. The earlier `0.1.0-rc.1` remains on the previous
collection contract. See [Catalogue](catalogue/index.md) and [Compatibility](compatibility.md)
for current provider guarantees.

**Breaking output change:** Export SVG artefacts and Review SVG evidence inherit the fixed
`data-rendered-by="Aster"` root attribute from the public SVG renderer. Exact SVG and generated
review HTML bytes therefore differ from `0.1.0-rc.1`; consumers comparing complete outputs must
update their fixtures. CLI does not add its own marker or change command grammar. The published
CLI depends on SVG `^0.1.0-rc.2`.

**Compatible capability:** The standalone CLI now accepts
`aster version <core|icons|svg|cli>` and `aster version --all`, each with optional `--json`.
Named requests read only the selected public package manifest; `--all` reports Core, Icons,
SVG and CLI in that order. Versions come from the packages resolved by the installed CLI, not
from the caller's directory or the registry. This historical source selection was corrected
after publication; it is not the current source contract. The programmatic command accepts an
optional version scope with explicit host-supplied package evidence and returns a distinct
`package-versions` payload. Plain `aster version` and its original JSON payload remain unchanged;
the private Import package is not reported. `help version` and `help review` also resolve through
the accepted shell help path. Missing or invalid post-startup metadata fails without partial
output. This capability is **not** present in the published `0.1.0-rc.1` archive and introduces
no new runtime dependency. The published CLI depends on Core, Icons and SVG `^0.1.0-rc.2`.
See [CLI Shell](shell/index.md) for the corrected source contract; this section records the
immutable published candidate.

## 0.1.0-rc.1

Status: **Published on 22 September 2026**. This is the formal release candidate for the first
public `0.1.0`, not a previously supported release. No consumer migration is required.

Registry: [`@luscious-garden/aster-cli@0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-cli/v/0.1.0-rc.1)

Approved archive SHA-256: `39E5C9A172CEDE79EDC20A13F4127EB702C1A1F0471CC5C8B4328CF74248D364`.

**Compatible capability:** `@luscious-garden/aster-cli` exposes the host-neutral `AsterCommands` API and explicit
`AsterCatalogue` provider through its root, plus the standalone `aster` binary. The executable
supports `list`, `search`, `show`, `export`, `review`, `help`, and `version`. Catalogue discovery
uses Icons metadata and loads exact definitions only when an operation requires them. Runtime
dependencies are `@luscious-garden/aster-core@^0.1.0-rc.1`, `@luscious-garden/aster-icons@^0.1.0-rc.1`, and `@luscious-garden/aster-svg@^0.1.0-rc.1`.

**Accepted limits:** The executable requires Node `>=24.10.0 <25`. It has no plugin registration,
registry-backed `add`, watch mode, or external-source import command. Only the package root and
private binary are mapped; no implementation subpath is public. See [CLI](index.md),
[Compatibility](compatibility.md), and [Workflow](workflow.md) for supported behaviour.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
