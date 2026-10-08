# Icons Authoring Workflow

Status: **Accepted**

Icons uses TypeScript-first authoring. Canonical icon modules own geometry and resolved metadata;
collection modules own explicit membership. SVG and static review are derived evidence.

## Canonical flow

```text
edit canonical icon/collection modules
    |
    +--> public Core construction
    +--> catalogue validation and generated projections
    |
    v
build public definition subpaths
    |
    v
SVG export and static review -> automated and curatorial acceptance
```

[Glyphs](glyphs/index.md) and [Collections](collections/index.md) own distribution behaviour.
[Catalogue Source Tooling](../../tooling/catalogue/index.md#source-convention) owns exact layouts,
symbols, reserved names, static grammar and source-to-public-path mapping.

## Add or correct artwork

1. Choose the independent canonical identity and create or edit its `.icon.ts` module.
2. Call public `Icon.define()` with complete portable data, composing applicable
   [authorship and visual inputs](authoring/index.md).
3. Establish provenance and effective artwork rights under the
   [collection's acceptance policy](../../collections/index.md) and
   [legal authorities](index.md#rights-boundary).
4. Import the definition into each intended collection and assign an explicit alias in its
   ordered `icons` dictionary.
5. Build, inspect the generated projections, run automated checks and review the derived artwork.

Omitting membership leaves a valid standalone definition. Correct geometry in the canonical
module, never in a generated facade, manifest or rendered SVG.

A rendition uses the same icon name with a distinct `identity.variant`; a different concept
uses a separate name. The package currently has no renditions. The enforced naming/layout
examples belong to [Catalogue Source Tooling](../../tooling/catalogue/index.md#source-convention).

## Add or change a collection

Create or edit one canonical `.collection.ts` module with its own metadata and named member
imports. Author membership as explicit assignments:

```text
icons: {
  camera: Camera,
  search: Search,
}
```

Core derives `members` from this dictionary; do not author a second list. The
[Core Collection contract](../core/collection/index.md) owns aliases, order and retention.
Removing or renaming an alias, changing order or altering membership requires
[compatibility review](../../project/versioning.md). New package artwork is not automatically
added to existing collections.

## Build and verification

```sh
pnpm --dir packages/icons run build
pnpm --dir packages/icons run test
pnpm run test:workflow
```

Build synchronises the generated manifest, exact loaders and isolated facades before compilation.
The [catalogue workflow](../../tooling/catalogue/index.md#workflow) owns commands, drift checks
and publication safety; [Icons Quality](quality.md) owns evidence coverage. Generated files are
reconstructable projections and must never be edited manually.

## Derived review

The public [SVG renderer](../svg/index.md) creates standalone markup; CLI
[export](../cli/export/index.md) and [review](../cli/review/index.md) own artefact plans and static
visual evidence. Derived files can be discarded and regenerated; they neither replace canonical
identity/geometry nor enter Icons distribution without an explicit distribution decision.

Automated checks establish implemented structural and geometric constraints. Each
[collection authority](../../collections/index.md) separately owns recognition, optical balance,
negative space, family consistency and documented exceptions. Amellus records its accepted
[review surface and findings](../../collections/amellus/index.md#static-visual-acceptance).

## Optional source adoption

Private [Import](../import/index.md) may translate acquired, reviewed SVG into editable TypeScript
with explicitly supplied Core metadata. Once accepted, that module becomes ordinary human-owned
Icons source. Import and the acquired file remain outside its build and runtime dependencies.

This is a controlled transformation, not a lossless design-tool round trip. Source provenance and
effective artwork rights still require review before distribution.
