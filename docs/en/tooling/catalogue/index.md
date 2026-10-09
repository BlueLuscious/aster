# Catalogue Source Tooling

Status: **Accepted**

Catalogue tooling discovers canonical Icons TypeScript sources, validates identities and
relationships, and synchronises metadata, exact dynamic loaders and public definition facades.
It is private build infrastructure, not runtime discovery or an authoring source.

## Ownership

Editable sources live under `src/glyphs/**/*.icon.ts` and
`src/collections/**/*.collection.ts`. The synchroniser exclusively owns:

- `src/generated/manifest/index.ts`;
- `src/generated/dynamic/index.ts`;
- `src/generated/facades/icons/**/*.ts`;
- `src/generated/facades/collections/*.ts`.

Generated files are versioned for clean-checkout resolution. Their headers name the reconstruction
command and prohibit manual editing; `.gitattributes` keeps this subtree on LF so read-only checks
compare serialised bytes consistently. Membership remains authored in each collection, never
inferred from directories.

## Source convention

Discovery accepts exact role filenames recursively beneath configured roots, excluding unsupported
files and non-file entries. An icon exports exactly one constant with the PascalCase form of its
slug: `arrow-left.icon.ts` exports `ArrowLeft`.

Only the nested layout is accepted:

```text
src/glyphs/<initial>/<name>/<name>.icon.ts
src/glyphs/<initial>/<name>/<name>-<variant>.icon.ts
src/collections/<initial>/<name>/<name>.collection.ts
```

The initial directory equals the first letter of the complete name. Names begin with an ASCII
lowercase letter and use lowercase alphanumeric segments separated by one hyphen; variants use
Core's portable slug syntax.
A base filename repeats the complete name, and a variant appends its declared variant. Thus
`c/camera-retro/camera-retro-filled.icon.ts` declares name `camera-retro`, variant `filled`
and export `CameraRetroFilled`, not name `camera`.

Collections have no variants and append `Collection` to the PascalCase symbol:
`amellus.collection.ts` exports `AmellusCollection`. Every definition calls its configured
public `Icon.define(...)` or `Collection.define(...)` factory through a named runtime Core import.
The direct object's literal identity must agree with the path.

A collection's explicit `icons` object assigns lower camel-case aliases directly to identifiers
from named relative runtime imports, for example `icons: { camera: Camera }`. Each imported
specifier and symbol must resolve to one discovered canonical icon. The dictionary rejects arrays,
shorthand, quoted/computed keys, spreads, accessors, calls, nested values, non-runtime imports,
duplicate aliases and duplicate members. `catalogueCollectionIconAliasPatternSource` owns static
alias grammar; [Core](../../packages/core/collection/index.md) independently validates runtime
construction. Valid aliases may shadow inherited names.

Static metadata authorities must be exported top-level constants acquired through named runtime
imports. `CatalogueSourceValueResolver` interprets a finite data-only TypeScript subset, never
executes source, and rejects executable or cyclic metadata. Inspection rejects invalid TypeScript
or layout, mismatched identities, missing/additional exports, duplicate properties or identities,
dangling members and conflicting public subpaths before publication.

The names `collections`, `dynamic` and `manifest` are reserved integration subpaths. Symbols may
repeat across isolated module scopes; no aggregate definition barrel is generated.

## Composition

| Authority | Responsibility |
| --- | --- |
| `CatalogueSourceSynchroniserFactory` | Composes filesystem, inspection, planning and serialisation capabilities. |
| `NodeCatalogueSourceFileSystem`, `RepositoryFileWalker` | Acquire selected source modules deterministically. |
| `CatalogueSourceModuleInspector` | Coordinates module acquisition and inspection. |
| `CatalogueSourceLayoutNormaliser` | Maps physical paths to identities, symbols and public subpaths. |
| `CatalogueSourceSyntaxInspector` | Extracts factory calls, literal identity and membership references. |
| `CatalogueSourceManifestInspector`, `CatalogueSourceValueResolver` | Validate and statically resolve descriptive metadata. |
| `CatalogueSourceRelationshipInspector` | Validates references across complete source families. |
| `CatalogueSourceFacadePlanner`, `CatalogueSourceFacadeResolver` | Plan minimal named re-exports and their logical paths. |
| `CatalogueSourceManifestPlanner`, `CatalogueSourceDynamicPlanner` | Plan metadata records and exact deferred imports. |
| `CatalogueSourceKeySerialiser` | Shares canonical key formation between generated integrations. |
| `CatalogueSourceSynchroniser`, `CatalogueSourceSerialiser` | Complete immutable inspection and output planning, then publish changed outputs. |

The synchroniser snapshots source-family descriptors and excluded-directory lists at construction.
Injected filesystem, inspector and planner capabilities remain borrowed. Static document/value
caches last one complete inspection and are cleared before the next.

## Internal contracts

| Contract | Responsibility and relationship |
| --- | --- |
| `ICatalogueSourceFamily` | Configures a family's Core factory, physical root and generated facade root. |
| `ICatalogueSourceIdentity` | Carries path-owned name, optional variant, symbol and public subpath from layout normalisation. |
| `ICatalogueCollectionMemberReference` | Retains an alias and its imported identifier, exported symbol and module specifier for relationship validation. |
| `ICatalogueIconManifestData` | Carries statically extracted icon metadata without geometry. |
| `ICatalogueCollectionManifestData` | Carries extracted collection metadata and ordered member keys. |
| `ICatalogueIconManifestRecord` | Adds the canonical key, public symbol and identity to icon data for manifest serialisation. |
| `ICatalogueCollectionManifestRecord` | Couples a canonical key, public symbol and identity with collection metadata and ordered member keys. |
| `ICatalogueSourceSyntaxInspection` | Couples extracted manifest data with syntax-owned member references. |
| `ICatalogueSourceModule` | Combines path identity, source location, manifest data and relationships for a validated module. |
| `ICatalogueSourceFamilyInspection` | Groups canonically ordered validated modules for one family. |
| `ICatalogueSourceOutput` | Describes a generated relative path and complete deterministic content. |
| `ICatalogueSourcePlan` | Separates fixed outputs from the atomically published facade set. |
| `ICatalogueSourceFileSystem` | Isolates acquisition, persistence and owned-directory replacement from policy. |

## Workflow

1. Create, change or remove a canonical definition.
2. Update affected collections' named imports and alias dictionaries.
3. Run `pnpm --dir packages/icons run build`, which synchronises before compilation.

`generate:catalogue` performs synchronisation directly; `check:catalogue` compares without writing.
Root `pnpm check` runs the read-only check before building, so a build cannot hide uncommitted drift.

Planning emits base facades at `icons/<name>.ts`, variant facades at
`icons/<name>/<variant>.ts` and collection facades at `collections/<name>.ts`.
Manifest records and dynamic loaders share canonical keys; loaders target facades, not source
paths. One private serialiser method emits both typed loader-map literals, removes their
prototypes and freezes them before export, preserving the
[exact absence guarantee](../../packages/icons/dynamic/index.md#arbitrary-key-access).
Generated specifiers use portable relative paths and LF text. The
[Icons workflow](../../packages/icons/workflow.md) owns consumer-facing distribution and membership
semantics; [manifest](../../packages/icons/manifest/index.md) and
[dynamic](../../packages/icons/dynamic/index.md) guides own their public contracts.

## Publication safety

Discovery, syntax, identities, relationships and the complete plan must succeed before any output
changes. Check-only execution reports missing, stale or obsolete paths without creating or
removing files.

Fixed manifest and dynamic outputs are written independently when content changes. The entire
facade root is published through an adjacent stage and backup: failed publication restores the
previous root, while success removes obsolete facades as one owned set. This is not a transaction
across all three outputs. After interruption, read-only checking diagnoses drift and deterministic
regeneration restores the set.

Cleanup may replace only `src/generated/facades`, never canonical glyph or collection roots.
The synchroniser owns no review document, source cache or temporary canonical artwork.

## Runtime boundary and verification

Generated manifest imports are type-only; dynamic imports defer facade evaluation. Consumers use
ordinary ESM data without filesystem or repository-tooling access.

Conformance covers deterministic regeneration, idempotence, drift, nested addition/removal,
variant mapping, reserved subpaths, stale-output cleanup, syntax/identity failures, static
authorities, rejected executable/cyclic metadata, dangling members and manifest-loader key
equivalence. A generated-output fixture retains valid own `constructor` loaders in both families
and verifies inherited-name absence. Package and CLI tests verify isolated imports, discovery,
identity and ordering.
