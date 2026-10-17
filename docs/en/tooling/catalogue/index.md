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
files and non-file entries. Each source exports exactly one constant with the PascalCase form of its
name and treatment: `arrow-left-outline.icon.ts` exports `ArrowLeftOutline`.

Only the nested layout is accepted:

```text
src/glyphs/<initial>/<name>/<name>-<variant>.icon.ts
src/collections/<initial>/<name>/<name>.collection.ts
```

The initial directory equals the first letter of the complete name. Names begin with an ASCII
lowercase letter and use lowercase alphanumeric segments separated by one hyphen; variants use
Core's portable slug syntax.
Every icon filename repeats the complete name and appends its required treatment. Thus
`c/camera-retro/camera-retro-filled.icon.ts` declares name `camera-retro`, variant `filled`
and export `CameraRetroFilled`, not name `camera`.

Collections have no variants or appended role suffix: `amellus.collection.ts` exports `Amellus`.
Every definition calls its configured public `Icon.define(...)` or `Collection.define(...)`
factory through an unaliased named runtime Core import. The direct object's literal identity
must agree with the path. [Icons Collections](../../packages/icons/collections/index.md#export-naming-migration)
owns consumer access and the export-naming migration.

A collection's explicit `icons` object assigns lower camel-case aliases to non-empty literal
treatment dictionaries, for example `icons: { camera: { outline: CameraOutline } }`. Each leaf
is an identifier from a named relative runtime import of one discovered canonical icon.
Outer keys are identifiers; inner keys may be identifiers or string literals, including numeric
strings. Numeric literals, computed keys, shorthand, spreads, accessors, calls, further nested
values, non-runtime imports, duplicate properties and duplicate members are rejected.

`catalogueCollectionIconAliasPatternSource` owns static alias grammar. Public Core
[`Icon.variantPropertyName()`](../../packages/core/api/index.md#usage) owns treatment-to-property
mapping; every group must select one `(namespace, name)` family. The inspector preserves native
outer/inner enumeration, including integer-index ordering, before emitting flat member identities.
Valid own shadowing names remain usable. [Core](../../packages/core/collection/index.md)
independently enforces the same grouped semantics at runtime.

Static metadata authorities must be exported top-level constants acquired through named runtime
imports. `CatalogueSourceValueResolver` interprets a finite data-only TypeScript subset, never
executes source, and rejects executable or cyclic metadata. Inspection rejects invalid TypeScript
or layout, mismatched identities, missing/additional exports, duplicate properties or identities,
dangling members and conflicting public subpaths before publication.

The names `collections`, `dynamic` and `manifest` are reserved integration subpaths. Symbols may
repeat across isolated module scopes; no package-wide definition barrel is generated.

Glyph dictionaries derive from complete `(namespace, name)` identity. The public route contains
only the glyph name, so different namespaces claiming that route are rejected, even with disjoint
treatments. Each dictionary owns exact properties derived through `Icon.variantPropertyName()`;
collisions such as `tone-1`/`tone1`, duplicate imported bindings or an imported leaf colliding with
the dictionary's export are rejected before any output writes. Symbols in independent modules
need not be globally unique.

## Composition

| Authority | Responsibility |
| --- | --- |
| `CatalogueSourceSynchroniserFactory` | Composes filesystem, inspection, planning and serialisation capabilities. |
| `NodeCatalogueSourceFileSystem`, `RepositoryFileWalker` | Acquire selected source modules deterministically. |
| `CatalogueSourceModuleInspector` | Coordinates module acquisition and inspection. |
| `CatalogueSourceLayoutNormaliser` | Maps physical paths to identities and definition symbols; derives glyph dictionary export names using the same PascalCase authority. |
| `CatalogueSourceSyntaxInspector` | Extracts factory calls, literal identity and membership references. |
| `CatalogueSourceManifestInspector`, `CatalogueSourceValueResolver` | Validate and statically resolve descriptive metadata. |
| `CatalogueSourceRelationshipInspector` | Validates references across complete source families. |
| `CatalogueSourceFacadePlanner`, `CatalogueSourceFacadeResolver` | Plan minimal treatment/collection re-exports, collision-free glyph dictionaries and their logical paths. |
| `CatalogueSourceManifestPlanner`, `CatalogueSourceDynamicPlanner` | Plan metadata records and exact deferred imports. |
| `CatalogueSourceExportsPlanner` | Derives treatment export patterns from validated inspections and plans a text-preserving edit of the reserved package-manifest entries. |
| `CatalogueSourceKeySerialiser` | Shares canonical key formation between generated integrations. |
| `CatalogueSourceSynchroniser`, `CatalogueSourceSerialiser` | Complete immutable inspection and output planning, then publish changed outputs. |

The synchroniser snapshots source-family descriptors and excluded-directory lists at construction.
Injected filesystem, inspector and planner capabilities remain borrowed. Static document/value
caches last one complete inspection and are cleared before the next.

## Internal contracts

| Contract | Responsibility and relationship |
| --- | --- |
| `ICatalogueSourceFamily` | Configures a family's Core factory, physical root and generated facade root. |
| `ICatalogueSourceIdentity` | Carries path-owned name and symbol; treatment is required for icons and absent for collections. |
| `ICatalogueCollectionMemberReference` | Retains the outer alias, treatment property and imported identifier, exported symbol and module specifier for relationship validation. |
| `ICatalogueIconManifestData` | Carries statically extracted icon metadata without geometry. |
| `ICatalogueCollectionManifestData` | Carries extracted collection metadata and ordered member keys. |
| `ICatalogueIconManifestRecord` | Adds the canonical key, public symbol and identity to icon data for manifest serialisation. |
| `ICatalogueCollectionManifestRecord` | Couples a canonical key, public symbol and identity with collection metadata and ordered member keys. |
| `ICatalogueSourceSyntaxInspection` | Couples extracted manifest data with syntax-owned member references. |
| `ICatalogueSourceModule` | Combines path identity, source location, manifest data and relationships for a validated module. |
| `ICatalogueSourceFamilyInspection` | Groups canonically ordered validated modules for one family. |
| `ICatalogueSourceOutput` | Describes a generated relative path and complete deterministic content. |
| `ICatalogueSourceDirectory` | Couples one exclusively owned absolute directory root to its complete expected outputs. |
| `ICatalogueSourcePlan` | Separates independently written files from ordered owned-directory publications. |
| `ICatalogueSourcePackageEdit` | Couples the exact reviewed preimage to a mixed-manual package edit, separate from generated output ownership. |
| `ICatalogueSourceFileSystem` | Isolates acquisition, persistence and owned-directory replacement from policy. |

## Workflow

1. Create, change or remove a canonical definition.
2. Update affected collections' named imports and alias dictionaries.
3. Prepare Core with `pnpm --filter @luscious-garden/aster-core run build`, then run
   `pnpm --dir packages/icons run build`, which synchronises before compilation.

`generate:catalogue` performs synchronisation directly; `check:catalogue` compares without writing.
Generated content comparison reads each expected file directly, treating only `ENOENT` as absence;
empty content remains distinct and all other read failures propagate before publication. Canonical
source acquisition remains strict.
Standalone synchronisation/checking requires a built Core because it uses the public property
authority. Root `pnpm check:catalogue` builds only Core, then compares Icons output without
regenerating it. Root `pnpm check` runs that gate before other builds, so generation cannot hide
uncommitted drift. Icons does not rebuild Core from a hook; recursive builds use dependency order.

Planning emits dictionary-only glyph facades at `glyphs/<name>.ts`, individual treatment
facades at `icons/<name>/<variant>.ts` and collection facades at `collections/<name>.ts`.
Each glyph module imports its actual canonical leaves, removes the map's prototype and freezes
the exact inferred dictionary before exporting only `<PascalName>Variants`. It never re-exports
the individual leaves or invents a default. Leaf modules have no reverse dependency on dictionaries.
Adding/removing a treatment updates its dictionary; removing a glyph removes its stale dictionary
inside the existing facade cleanup boundary. No separate manual registry or loader is added.
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
removing files. Both publication lifecycles share content comparison; expected paths retain plan
order and obsolete directory entries follow deterministic traversal order. All groups are compared
before the first write.

The complete plan validates canonical absolute/package-relative output paths, strict package
containment, disjoint publication boundaries and separation from canonical source roots. Duplicate,
case-only and file/directory-conflicting output paths are rejected before comparison or writes.
These are lexical path guarantees, not symlink resolution. Empty owned sets remove obsolete files
without claiming adjacent directories; an absent empty directory does not create content drift.

Fixed manifest and dynamic outputs are written independently when content changes. The entire
facade root is published through an adjacent stage and backup: failed publication restores the
previous root, while success removes obsolete facades as one owned set. Each directory group has
its own publication lifecycle; this is not a transaction across all generated files and directories.
Earlier independent writes may remain after a later publication fails. Read-only checking diagnoses
that drift and deterministic regeneration restores the set.

Cleanup may replace only `src/generated/facades`, never canonical glyph or collection roots.
The synchroniser owns no review document, source cache or temporary canonical artwork.

### Mixed package-manifest ownership

`package.json` is not a generated file. Only `exports["./*"]` and canonical `exports["./*/<variant>"]`
properties are generated: the first targets the sibling glyph dictionaries, and the sorted suffix patterns
target individual treatment files. Both targets derive from the facade resolver, not another
treatment catalogue. A pattern does not promise every glyph has that treatment; missing files
still fail natively. Fixed metadata/collection entries retain precedence and their manual text.

Planning requires an existing strict JSON manifest with an exports object. It rejects duplicate
properties, malformed treatment patterns, conflicting targets/conditions and manual routes that
shadow generated glyphs or treatments. Existing canonical patterns identify owned entries;
unrecognised targets fail rather than being silently claimed. The previous flat icon wildcard is
accepted only as a migration input. Missing entries are added and obsolete canonical patterns are
removed. Unowned property text, line endings and text outside the exports object remain intact.

Check-only mode reports package drift without writing; the manifest does not increase the generated
file count. Complete planning and a preimage recheck precede the first generated write. Package
publication follows generated files and directories. A later package failure can leave those
earlier writes in place; another check and generation repair remaining drift, not a global rollback.

Publication stages the complete next text, displaces and verifies the old text, and uses an
exclusive hard-link destination instead of overwriting a reappeared path. It verifies same-volume
hard-link support using private staging before displacing the original file. Detected
edits before publication or in displaced bytes stop the operation. If another writer recreates the
destination, both its text and the displaced backup are retained for manual inspection; private
staging is cleaned. This is not an operating-system lock against arbitrary non-cooperating writers
or writes through previously opened file descriptors. Architecture validates permitted pattern
shapes/targets; catalogue checking validates the exact set against current source treatments.
Pre-existing package stage/backup entries stop both checking and generation before writes, even
if the manifest is absent. Inspect the retained files and restore the intended manifest before
removing that evidence explicitly; generation never guesses which interrupted text to discard.

## Runtime boundary and verification

Generated manifest imports are type-only; dynamic imports defer facade evaluation. Consumers use
ordinary ESM data without filesystem or repository-tooling access.

Conformance covers deterministic regeneration, idempotence, drift, nested addition/removal,
variant mapping, reserved subpaths, stale-output cleanup, syntax/identity failures, static
authorities, rejected executable/cyclic metadata, dangling members and manifest-loader key
equivalence. Publication boundary tests cover invalid/overlapping ownership before filesystem
comparison, empty sets, unchanged-output no-ops, failures before writes, partial independent writes,
directory rollback after a real rename failure and successful retry. A generated-output fixture
retains valid own `constructor` loaders in both families
and verifies inherited-name absence. Package and CLI tests verify isolated imports, discovery,
identity and ordering.
Emitted disposable-process tests also prove multi-treatment evaluation isolation, eager glyph
loading, metadata-only imports, exact numeric/own-shadowing keys and shared canonical leaf objects.
