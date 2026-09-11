# Icons Quality

Status: **Experimental**

`@aster/icons` quality evidence protects canonical authored definitions, independent collection
composition, generated catalogue sources and the package's distributable public surface. The
catalogue remains experimental, so this evidence establishes current correctness rather than a
stable artwork or compatibility promise.

## Source evidence

Runtime tests discover every canonical icon and collection from generated immutable indexes. They
require both families to be non-empty, reconstruct every definition through public `@aster/core`,
verify deep immutability and uniqueness, and validate bidirectional collection membership without
assuming a fixed catalogue count or collection identity.

Identity-specific assertions remain only where the identity carries the behaviour under test.
Declared directional arrow pairs therefore retain exact RTL and relationship evidence; generic
validity, membership and discovery do not select a named icon or collection.

Compile-time tests verify root indexes, isolated icon imports, collection-family imports, immutable
contracts and rejected mutation. Catalogue source tooling separately proves that canonical
`.icon.ts` and `.collection.ts` modules deterministically regenerate their barrels and aggregate
indexes.

## Distribution evidence

ABI tests build the package and verify exact root, per-icon, collection-family and per-collection
exports against discovered canonical source modules. They also verify declarations, ESM loading,
object identity across import routes, `sideEffects: false`, dependency confinement to public
`@aster/core`, and rejection of implementation subpaths.

The exact exported subpath set is intentional distribution evidence even though its membership
grows with the catalogue. The test derives that set from canonical modules rather than maintaining
a second handwritten icon or collection inventory.

## Cross-package evidence

SVG corpus tests require and render every indexed icon without selecting current artwork. CLI
runtime, executable and clean-consumer tests discover representative non-empty catalogue values.
The repository authoring workflow discovers one non-empty collection and compares complete CLI
export artefacts with direct public SVG rendering.

These consumers prove catalogue interoperability without granting Icons rendering, command-line,
filesystem or repository-tooling authority. The transversal selection and exactness rules are
defined by the [Aster Testing Policy](../../project/testing.md).

## Retained boundary

- Canonical TypeScript modules remain the editable source of truth.
- Generated indexes are deterministic artefacts and are never edited manually.
- Package tests fail explicitly when required icon or collection families are empty.
- Generic tests remain independent from current catalogue counts, ordering, identities and artwork.
- Exact identities remain only where public routing or icon-owned semantics require them.
- No browser, DOM, renderer, importer, CLI or repository tool enters the production dependency
  graph.
