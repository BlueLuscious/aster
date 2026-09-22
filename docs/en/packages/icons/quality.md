# Icons Quality

Status: **Accepted**

`@aster/icons` quality evidence protects canonical authored definitions, independent collection
composition, generated catalogue sources and the package's distributable public surface. This
evidence accepts the current pre-release boundary and artwork without creating a stable-version
compatibility promise.

## Source evidence

Runtime tests discover every canonical icon and collection from generated manifests and exact
loaders. They require both families to be non-empty, reconstruct every definition through public
`@aster/core`, verify deep immutability and uniqueness, and validate collection membership against
independent icon loaders without assuming a fixed catalogue count or collection identity.

Collection-specific evidence separately protects Amellus's accepted twenty-six-member semantic
order, metadata, complete loader membership and independence from additional or reduced test
collections. This exact evidence belongs to the collection contract rather than the generic
catalogue-growth tests.

Distribution evidence requires every icon and collection to state its effective artwork licence
and attribution. A definition using `LicenseRef-Aster-Artwork-1.0` must attribute BlueLuscious;
other licences remain possible and are not replaced by package defaults.

Identity-specific assertions remain only where the identity carries the behaviour under test.
Declared directional arrow pairs therefore retain exact RTL and relationship evidence; generic
validity, membership and discovery do not select a named icon or collection.

Compile-time tests verify isolated definition imports, immutable loader contracts, manifest
contracts and rejected mutation. Runtime tests compare every metadata-only
manifest entry with canonical definitions, reject embedded geometry and verify deep freezing.
They also require loader and manifest keys to agree exactly, freeze every loader and resolve every
loader to its canonical definition.
Catalogue source tooling separately proves recursive canonical
`.icon.ts` and `.collection.ts` discovery, nested variant mapping, collection-reference integrity,
and deterministic manifest, loader and facade regeneration. It also proves that check-only execution
creates no output, stable facade paths survive canonical source movement, obsolete facades are
removed through one owned-directory publication, and rejected source relationships preserve every
existing generated file. Static extraction evidence covers imported constants without source
execution, rejected executable syntax and cyclic references.

For path nodes, the same corpus evidence traverses every structured command operand, enforces the
shared half-unit authoring grid and rejects definitions that exceed the collection command budget.
Raw SVG path text is not accepted as authored catalogue data.

## Distribution evidence

ABI tests build the package and verify blocked aggregate roots plus exact per-icon, per-collection,
manifest and dynamic exports against discovered canonical source modules. They also verify
declarations, ESM loading, object identity across direct and loader routes, `sideEffects: false`,
dependency confinement to public `@aster/core`, exact minimal facade modules, rejection of
implementation subpaths and isolated collection dependencies on only their explicitly declared
icon modules and local artwork-licence authority. The installed tarball contains both the
[ISC software notice](../../../../packages/icons/LICENSE) and
[artwork terms](../../../../packages/icons/ARTWORK-LICENCE.md).

The exact exported subpath set is intentional distribution evidence even though its membership
grows with the catalogue. The test derives that set from canonical modules rather than maintaining
a second handwritten icon or collection inventory.

A clean consumer installs actual locally packed Core and Icons tarballs with scripts disabled and
without registry access. Evidence compares the installed Icons payload with the complete emitted
distribution plus its package metadata, rejects source and test trees, compiles isolated icon,
collection, manifest and dynamic imports through published declarations, and executes the emitted
JavaScript without any workspace source file. Separate failure evidence removes one installed
facade and verifies that loader invocation preserves the native `ERR_MODULE_NOT_FOUND` rejection.

## Cross-package evidence

SVG corpus tests explicitly load and render every distributed icon without selecting current artwork. CLI
runtime, executable and clean-consumer tests discover representative non-empty catalogue values.
The repository authoring workflow discovers one non-empty collection and compares complete CLI
export artefacts with direct public SVG rendering.

Fresh-process module evaluation and emitted distribution are measured independently by the
[Icons Quality Baseline](quality-baseline.md). It distinguishes unavoidable collection-member
evaluation from the retired package-root aggregation and supplies control evidence for distribution
changes.

These consumers prove catalogue interoperability without granting Icons rendering, command-line,
filesystem or repository-tooling authority. The transversal selection and exactness rules are
defined by the [Aster Testing Policy](../../project/testing.md).

## Retained boundary

- Canonical TypeScript modules remain the editable source of truth.
- Generated manifest data, dynamic loaders and public facades are deterministic artefacts
  and are never edited manually.
- Package tests fail explicitly when required icon or collection families are empty.
- Generic tests remain independent from current catalogue counts, ordering, identities and artwork.
- Exact identities remain only where public routing or icon-owned semantics require them.
- No browser, DOM, renderer, importer, CLI or repository tool enters the production dependency
  graph.
