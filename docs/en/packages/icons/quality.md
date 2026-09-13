# Icons Quality

Status: **Accepted**

`@aster/icons` quality evidence protects canonical authored definitions, independent collection
composition, generated catalogue sources and the package's distributable public surface. This
evidence accepts the current pre-release boundary and artwork without creating a stable-version
compatibility promise.

## Source evidence

Runtime tests discover every canonical icon and collection from generated immutable indexes. They
require both families to be non-empty, reconstruct every definition through public `@aster/core`,
verify deep immutability and uniqueness, and validate collection membership against the independent
icon index without assuming a fixed catalogue count or collection identity.

Collection-specific evidence separately protects Amellus's accepted twenty-six-member semantic
order, metadata, complete icon-index membership and independence from additional or reduced test
collections. This exact evidence belongs to the collection contract rather than the generic
catalogue-growth tests.

Identity-specific assertions remain only where the identity carries the behaviour under test.
Declared directional arrow pairs therefore retain exact RTL and relationship evidence; generic
validity, membership and discovery do not select a named icon or collection.

Compile-time tests verify root indexes, isolated icon imports, collection-family imports, immutable
contracts and rejected mutation. Catalogue source tooling separately proves recursive canonical
`.icon.ts` and `.collection.ts` discovery, nested variant mapping, collection-reference integrity,
and deterministic barrel and aggregate regeneration. It also proves that check-only execution
creates no output and that rejected source relationships preserve every existing generated file.

For path nodes, the same corpus evidence traverses every structured command operand, enforces the
shared half-unit authoring grid and rejects definitions that exceed the collection command budget.
Raw SVG path text is not accepted as authored catalogue data.

## Distribution evidence

ABI tests build the package and verify exact root, per-icon, collection-family and per-collection
exports against discovered canonical source modules. They also verify declarations, ESM loading,
object identity across import routes, `sideEffects: false`, dependency confinement to public
`@aster/core`, rejection of implementation subpaths and isolated collection dependencies on only
their explicitly declared icon modules.

The exact exported subpath set is intentional distribution evidence even though its membership
grows with the catalogue. The test derives that set from canonical modules rather than maintaining
a second handwritten icon or collection inventory.

## Cross-package evidence

SVG corpus tests require and render every indexed icon without selecting current artwork. CLI
runtime, executable and clean-consumer tests discover representative non-empty catalogue values.
The repository authoring workflow discovers one non-empty collection and compares complete CLI
export artefacts with direct public SVG rendering.

The source-migration workflow is intentionally exact rather than catalogue-neutral. It records
every retained identity, exported symbol, current source path, planned nested destination,
supported import and collection member before the private source layout changes. Canonically
ordered SHA-256 evidence independently protects complete portable icon values, complete collection
values and deterministic SVG markup. Object keys are ordered before hashing so property insertion
order does not make the evidence host-dependent.

This baseline complements rather than replaces generic growth tests. Adding or deliberately
changing artwork requires an explicit baseline update while migration is pending; moving sources
without changing their observable values must reproduce the existing hashes exactly. The baseline
can be retired after the nested layout and generated public facades have passed their final
equivalence comparison.

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
