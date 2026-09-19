# Catalogue Source Tooling

Status: **Accepted**

The `catalogue` tooling feature recursively discovers canonical `@aster/icons` TypeScript sources,
validates their identities and relationships, and synchronises aggregate outputs, metadata-only
distribution data and public definition facades. It is private
repository infrastructure, not runtime discovery, a public package API, or an icon-authoring
source.

## Ownership

Canonical `src/glyphs/**/*.icon.ts` and `src/collections/**/*.collection.ts` modules remain the
editable sources of truth. The synchroniser exclusively owns:

- `src/icons/index.ts`;
- `src/icons/constants/aster-icons.constant.ts`;
- `src/collections/index.ts`;
- `src/collections/constants/aster-collections.constant.ts`;
- `src/generated/manifest/index.ts`;
- `src/generated/facades/icons/**/*.ts`;
- `src/generated/facades/collections/*.ts`.

These generated files remain versioned so clean source checkouts, editors and package consumers
can resolve the package structure without first executing repository tooling. Their generated
headers identify the reconstruction command and prohibit manual editing.

Collection membership remains authored inside each canonical collection module. Synchronisation
does not infer membership, alter icon definitions or create collections from directories.
The facade root contains only minimal named re-exports and remains independent from the manifest
output root and future loader outputs.

## Source Convention

Only files with exact canonical roles are discovered recursively beneath their configured roots.
The glyph root contains no generated subtree. The collection `constants/` directory, generated
barrel, unsupported files and non-file directory entries do not enter canonical discovery.

An icon filename `<icon-slug>.icon.ts` must export exactly one constant whose name is the PascalCase
form of `<icon-slug>`. For example, `arrow-left.icon.ts` exports `ArrowLeft`.

The inspector accepts only the nested identity layout:

```text
src/glyphs/<initial>/<name>/<name>.icon.ts
src/glyphs/<initial>/<name>/<name>-<variant>.icon.ts
```

Nested base and variant examples export `Camera`, `CameraStippled`, `CameraRetro` and
`CameraRetroFilled` from:

```text
src/glyphs/c/camera/camera.icon.ts
src/glyphs/c/camera/camera-stippled.icon.ts
src/glyphs/c/camera-retro/camera-retro.icon.ts
src/glyphs/c/camera-retro/camera-retro-filled.icon.ts
```

The first directory must equal the first ASCII lowercase letter of the complete icon name. A base
filename repeats that name exactly. A variant filename appends one canonical variant slug, and its
`Icon.define(...)` identity must declare the same `name` and `variant`.

A collection filename `<collection-slug>.collection.ts` follows the same conversion and appends
`Collection`. For example, `amellus.collection.ts` exports `AmellusCollection`.

Collections use `src/collections/<initial>/<name>/<name>.collection.ts`; they do not have variants.
Their explicit
`icons` sequence may contain only identifiers acquired through named relative imports. Every member
specifier and imported symbol must resolve to one icon discovered in the same complete inspection.
Removing a referenced icon, pointing at an aggregate, or spelling its exported symbol incorrectly
therefore fails before generated outputs are touched.

Names begin with one ASCII lowercase letter and continue with lowercase alphanumeric segments
separated by one hyphen. Variants use portable Core slug syntax. Every canonical export must call
its configured public `Icon.define(...)` or `Collection.define(...)` factory with a direct object
whose literal identity agrees with its path. Invalid layout or TypeScript, mismatched identities,
missing exports, additional exported constants, duplicate identities, dangling members,
aggregate-name collisions and distinct identities that produce the same symbol are rejected before
any generated file is written.

The icon names `collections`, `dynamic` and `manifest` are reserved because those first-level
subpaths belong to collection or integration families. A base icon therefore cannot shadow them.
Each accepted base icon generates `src/generated/facades/icons/<name>.ts`; each rendition generates
`src/generated/facades/icons/<name>/<variant>.ts`; and each collection generates
`src/generated/facades/collections/<name>.ts`.

Every accepted source also contributes one metadata-only record to
`src/generated/manifest/index.ts`. The manifest retains complete identities, public symbols,
searchable metadata and ordered collection member keys, but never geometry, presentation policy or
complete definitions.

## Composition

```text
NodeCatalogueSourceFileSystem
        |
        v
RepositoryFileWalker --> CatalogueSourceModuleInspector
                              |             |
                              v             v
                  CatalogueSourceLayout  CatalogueSourceSyntax
                         Normaliser             Inspector
                                                   |
                                                   v
                                 CatalogueSourceManifestInspector
                                                   |
                                                   v
                                   CatalogueSourceValueResolver
                              \             /
                               v           v
                    CatalogueSourceRelationshipInspector
                                  |
                   CatalogueSourceSynchroniser
                         |              |
                         v              v
             CatalogueSourceFacade   CatalogueSourceManifest
                    Planner                  Planner
                         \              /
                          v            v
                    CatalogueSourceSerialiser
```

The module inspector coordinates acquisition only. The layout normaliser owns physical-path to
identity and symbol mapping; the syntax inspector owns TypeScript factory, literal identity and
membership extraction; the manifest inspector owns metadata shape; the value resolver statically
interprets its finite data-only TypeScript subset; and the relationship inspector owns cross-family
reference integrity. The facade and manifest planners own their distinct output projections. The
synchroniser builds the complete immutable inspection set before asking the serialiser for any
output, so source failures cannot partially replace generated files. Static document and value
caches are scoped to one complete synchronisation and cleared before the next inspection.

## Workflow

Package authors:

1. create or remove a canonical definition module;
2. update explicit membership in any affected collection modules;
3. run `pnpm --dir packages/icons run build`.

The build runs `generate:catalogue` before compilation. Generation walks entries deterministically,
normalises host paths to slash-separated records, validates every source family and cross-family
relationship, statically extracts distribution metadata, serialises portable relative specifiers
with LF line endings, and writes only changed independent outputs. It replaces the complete facade
root through adjacent stage and rollback
directories only when facade content or membership changes. A nested source therefore never
exposes a platform path separator in generated TypeScript.

`pnpm --dir packages/icons run generate:catalogue` performs synchronisation directly.
`pnpm --dir packages/icons run check:catalogue` performs a read-only comparison and fails when an
output is absent or stale. Root `pnpm check` runs the read-only check before any build so CI cannot
silently accept uncommitted generated drift.

## Publication safety

The synchroniser completes discovery, path and syntax validation, symbol and public-subpath
collision checks, cross-family membership validation and the complete output plan before replacing
any generated file. A rejected source set therefore preserves all existing outputs. Check-only
execution reports every missing, stale or obsolete path without creating or removing a file.

Catalogue tooling owns no review document, cache or temporary canonical source. Facade publication
writes a complete adjacent stage, moves the previous facade root to a unique backup, publishes the
stage and removes the backup. A failed publication restores the previous root; successful
publication removes obsolete facade files and directories as one owned set. The four transitional
aggregate outputs and generated manifest remain independently recoverable: an interrupted process is followed by
`check:catalogue`, which reports every incomplete or stale output, and deterministic regeneration
restores the set.

## Canonical source boundary

Each icon source lives beneath `src/glyphs/<initial>/<name>/`, independently from collection
membership. Each collection source lives beneath `src/collections/<initial>/<name>/`. Generated
facades preserve logical public subpaths without exposing either physical root. Transitional
aggregate outputs alone remain beneath `src/icons`; no canonical definition may be authored there.

Cleanup is deliberately finite. The synchroniser may replace only its
`src/generated/facades` root; it must never recursively delete from a canonical icon or collection
source root. The four transitional barrels and authorities remain explicit paths until their eager
surface is retired. The manifest remains a separate fixed output because it has a distinct public
contract and lifecycle from minimal definition facades.

## Runtime Boundary

Generated outputs are ordinary side-effect-free ESM sources. The emitted manifest has no runtime
imports because its contract imports are type-only. `@aster/icons`, `@aster/cli` and all consumers
import immutable values without accessing Node, tooling paths or the filesystem.

Conformance covers deterministic regeneration, idempotence, drift detection, nested addition and
removal, stale manifest record removal, rejection of transitional flat sources, variant mapping,
reserved public subpaths, stale facade cleanup, syntax and identity failure, static imported
authorities, rejected executable or cyclic metadata, symbol ambiguity and dangling collection membership.
Package and CLI tests
derive counts and paths from canonical authorities while retaining exact identity, ordering,
membership and isolated-subpath checks.
