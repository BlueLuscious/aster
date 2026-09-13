# Catalogue Source Tooling

Status: **Accepted**

The `catalogue` tooling feature recursively discovers canonical `@aster/icons` TypeScript sources,
validates their identities and relationships, and synchronises aggregate outputs. It is private
repository infrastructure, not runtime discovery, a public package API, or an icon-authoring
source.

## Ownership

Canonical `src/icons/**/*.icon.ts` and `src/collections/**/*.collection.ts` modules remain the
editable sources of truth. The synchroniser exclusively owns:

- `src/icons/index.ts`;
- `src/icons/constants/aster-icons.constant.ts`;
- `src/collections/index.ts`;
- `src/collections/constants/aster-collections.constant.ts`.

These generated files remain versioned so clean source checkouts, editors and package consumers
can resolve the package structure without first executing repository tooling. Their generated
headers identify the reconstruction command and prohibit manual editing.

Collection membership remains authored inside each canonical collection module. Synchronisation
does not infer membership, alter icon definitions or create collections from directories.

## Source Convention

Only files with exact canonical roles are discovered recursively beneath their configured roots.
The generated `constants/` directories, barrels, unsupported files and non-file directory entries
are excluded explicitly.

An icon filename `<icon-slug>.icon.ts` must export exactly one constant whose name is the PascalCase
form of `<icon-slug>`. For example, `arrow-left.icon.ts` exports `ArrowLeft`.

The inspector accepts direct base modules and the nested identity layout:

```text
src/icons/<name>.icon.ts
src/icons/<initial>/<name>/<name>.icon.ts
src/icons/<initial>/<name>/<name>-<variant>.icon.ts
```

Nested base and variant examples export `Camera`, `CameraStippled`, `CameraRetro` and
`CameraRetroFilled` from:

```text
src/icons/c/camera/camera.icon.ts
src/icons/c/camera/camera-stippled.icon.ts
src/icons/c/camera-retro/camera-retro.icon.ts
src/icons/c/camera-retro/camera-retro-filled.icon.ts
```

The first directory must equal the first ASCII lowercase letter of the complete icon name. A base
filename repeats that name exactly. A variant filename appends one canonical variant slug, and its
`Icon.define(...)` identity must declare the same `name` and `variant`. Direct modules represent
base definitions only.

A collection filename `<collection-slug>.collection.ts` follows the same conversion and appends
`Collection`. For example, `amellus.collection.ts` exports `AmellusCollection`.

Collections may equivalently use
`src/collections/<initial>/<name>/<name>.collection.ts`; they do not have variants. Their explicit
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
                              \             /
                               v           v
                    CatalogueSourceRelationshipInspector
                                  |
                                  v
                     CatalogueSourceSynchroniser
                                  |
                                  v
                       CatalogueSourceSerialiser
```

The module inspector coordinates acquisition only. The layout normaliser owns physical-path to
identity and symbol mapping; the syntax inspector owns TypeScript factory, literal identity and
membership extraction; and the relationship inspector owns cross-family reference integrity. The
synchroniser builds the complete immutable inspection set before asking the serialiser for any
output, so source failures cannot partially replace generated files.

## Workflow

Package authors:

1. create or remove a canonical definition module;
2. update explicit membership in any affected collection modules;
3. run `pnpm --dir packages/icons run build`.

The build runs `generate:catalogue` before compilation. Generation walks entries deterministically,
normalises host paths to slash-separated records, validates every source family and cross-family
relationship, serialises portable relative specifiers with LF line endings, and writes only changed
files. A nested source therefore never exposes a platform path separator in generated TypeScript.

`pnpm --dir packages/icons run generate:catalogue` performs synchronisation directly.
`pnpm --dir packages/icons run check:catalogue` performs a read-only comparison and fails when an
output is absent or stale. Root `pnpm check` runs the read-only check before any build so CI cannot
silently accept uncommitted generated drift.

## Publication safety

The synchroniser completes discovery, path and syntax validation, symbol-collision checks and
cross-family membership validation before replacing any generated file. A rejected source set
therefore preserves all four existing outputs. Check-only execution reports every missing or stale
path without creating a file.

Catalogue tooling owns no review document, backup, stage, cache or temporary source. Successful
synchronisation writes only changed complete contents at the four declared output paths. The
current four-file replacement is recoverable rather than a filesystem transaction across the
whole set: an interrupted process is followed by `check:catalogue`, which reports every incomplete
or stale output, and deterministic regeneration restores the set.

## Source migration boundary

The accepted nested layout has a reproducible pre-migration baseline. It maps each retained flat
icon source to `src/glyphs/<initial>/<name>/<name>.icon.ts` and each collection to
`src/collections/<initial>/<name>/<name>.collection.ts`. The mapping is derived from logical
identity, never from collection membership, and requires one unique destination for every source.
It does not move files or change supported imports.

Distribution changes must follow this order:

1. capture the current source inventory, package export map, supported imports, portable values,
   collection membership and rendered SVG evidence;
2. generate and verify stable public facades while the current sources and exports remain intact;
3. route supported package subpaths through those facades;
4. move canonical sources and update only their private relative references;
5. regenerate all owned outputs and compare the resulting definitions, membership, SVG and imports
   with the baseline;
6. remove obsolete generated outputs only after the complete replacement plan passes.

Cleanup is deliberately finite. Before the dedicated generated root becomes authoritative, only
`src/icons/index.ts`, `src/icons/constants/aster-icons.constant.ts`,
`src/collections/index.ts` and `src/collections/constants/aster-collections.constant.ts` are
recognised legacy generated outputs. Tooling must never recursively delete from a canonical icon
or collection source root.

## Runtime Boundary

Generated outputs are ordinary side-effect-free ESM sources. `@aster/icons`, `@aster/cli` and all
consumers import immutable values without accessing Node, tooling paths or the filesystem.

Conformance covers deterministic regeneration, idempotence, drift detection, flat and nested
addition and removal, variant mapping, reserved-directory exclusion, syntax and identity failure,
duplicate identity, symbol ambiguity and dangling collection membership. Package and CLI tests
derive counts and paths from canonical authorities while retaining exact identity, ordering,
membership and isolated-subpath checks.
