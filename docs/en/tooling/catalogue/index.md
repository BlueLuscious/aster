# Catalogue Source Tooling

Status: **Accepted**

The `catalogue` tooling feature synchronises aggregate `@aster/icons` TypeScript sources from
direct canonical definition modules. It is private repository infrastructure, not runtime
discovery, a public package API, or an icon-authoring source.

## Ownership

Canonical `src/icons/*.icon.ts` and `src/collections/*.collection.ts` modules remain the editable
sources of truth. The synchroniser exclusively owns:

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

Only direct files with exact canonical roles are discovered. Nested directories, barrels,
constants and unrelated TypeScript modules are excluded.

An icon filename `<icon-slug>.icon.ts` must export exactly one constant whose name is the PascalCase
form of `<icon-slug>`. For example, `arrow-left.icon.ts` exports `ArrowLeft`.

A collection filename `<collection-slug>.collection.ts` follows the same conversion and appends
`Collection`. For example, `amellus.collection.ts` exports `AmellusCollection`.

Slugs use lowercase ASCII alphanumeric segments separated by one hyphen. Invalid TypeScript,
missing exports, additional exported constants, aggregate-name collisions and distinct slugs that
produce the same symbol are rejected before any generated file is written.

## Workflow

Package authors:

1. create or remove a canonical definition module;
2. update explicit membership in any affected collection modules;
3. run `pnpm --dir packages/icons run build`.

The build runs `generate:catalogue` before compilation. Generation validates every source family,
sorts modules by canonical filename, serialises all four outputs with LF line endings and writes
only changed files.

`pnpm --dir packages/icons run generate:catalogue` performs synchronisation directly.
`pnpm --dir packages/icons run check:catalogue` performs a read-only comparison and fails when an
output is absent or stale. Root `pnpm check` runs the read-only check before any build so CI cannot
silently accept uncommitted generated drift.

## Runtime Boundary

Generated outputs are ordinary side-effect-free ESM sources. `@aster/icons`, `@aster/cli` and all
consumers import immutable values without accessing Node, tooling paths or the filesystem.

Conformance covers deterministic regeneration, idempotence, drift detection, representative
addition and removal, syntax failure, naming failure and symbol ambiguity. Package and CLI tests
derive counts and paths from canonical authorities while retaining exact identity, ordering,
membership and isolated-subpath checks.
