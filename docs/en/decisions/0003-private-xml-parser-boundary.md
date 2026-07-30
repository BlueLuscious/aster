# 0003: Private XML Parser Boundary

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-07-28**

Affected documents:

- [SVG Processing Pipeline](../architecture/svg-processing-pipeline.md)
- [Private Build Domain](../packages/build/index.md)
- [Build SVG Parser](../packages/build/parser/index.md)

Supersedes: **None**

Superseded by: **None**

## Context

Aster must interpret untrusted SVG imports without coupling portable runtime packages to XML,
DOM, browser, or parser-library contracts. Implementing a conforming XML and namespace parser
inside the initial ingestion spike would add substantial syntax and security responsibility that
is unrelated to the icon domain.

The selected dependency still cannot become trusted authority. Parser recovery, diagnostics,
document-shape assumptions, and token types vary between libraries. In particular, a token parser
may establish tag well-formedness while leaving single-root document rules and source-policy
limits to its caller.

## Decision drivers

- Strict XML tokenisation and namespace resolution.
- Exact UTF-16 source offsets.
- Explicit rejection of document type declarations.
- Browser-, DOM-, filesystem-, and Node-adapter independence.
- Native ESM compatible with the ES2022 package target.
- Minimal and auditable transitive dependency surface.
- Replaceability behind Aster-owned contracts and conformance fixtures.
- No parser types, messages, or recovery output in observable Aster contracts.

## Options

### Aster-owned XML tokenizer

A dedicated tokenizer would eliminate the production dependency and provide exact control over
locations. It would also make Aster immediately responsible for XML grammar, namespaces, entity
behaviour, malformed-input recovery, denial-of-service resistance, and conformance evidence.
That responsibility is disproportionate before an independent XML-tooling product exists.

### Archived strict SAX parser

`saxes` provides mature strict XML, namespace, and position behaviour with a small dependency
surface. Its upstream repository was archived in December 2025, so it does not satisfy the
maintenance criterion for a new safety boundary.

### Private zero-dependency token parser

`xmlsax-typescript` provides namespace-aware tokens, exact offsets, configurable document-type
rejection, modern ESM, and no transitive production dependencies. Its ecosystem is young and its
token stream does not independently prove every XML or Aster document invariant, so it requires
an owned adapter and conformance suite.

## Decision

The private `@aster/build` package pins `xmlsax-typescript` version `1.0.0` as its initial XML
token parser.

The dependency is confined to `SvgParser`, which implements the internal `ISvgParser` contract.
The adapter converts tokens immediately into Aster-owned values. Parser-library types and
diagnostics cannot cross that implementation file or enter the package root.

Aster independently enforces:

- one complete document root;
- accepted XML 1.0 characters, comment structure, and unique qualified attributes;
- SVG element namespace safety;
- rejection of document types, entity references, processing instructions, executable content,
  raster or embedded content, event handlers, resource references, and foreign namespaces;
- fixed source length, element count, depth, and per-element attribute limits;
- exact source spans recovered from canonical content;
- failure results without partial syntax.

Comments and XML whitespace remain inert. Structural groups and source order remain in the
internal syntax model for later validation and normalisation.

## Consequences

### Positive

- Aster avoids implementing general XML parsing during the icon-ingestion foundation.
- The selected dependency adds no transitive production package.
- Portable Core and future renderer packages remain parser-independent.
- Exact parser conformance and replacement evidence is owned by Aster fixtures.
- A future Aster-owned tokenizer can replace the adapter without changing pipeline contracts.

### Negative

- The private Build package has one production dependency.
- A young dependency requires stronger local conformance coverage and review before upgrades.
- Aster must enforce document-level and resource-limit behaviour not proven by the raw token
  stream.
- Replacing or upgrading the parser requires rerunning security and location fixtures.

### Deferred

- An Aster-owned XML tokenizer requires a separately justified product and maintenance boundary.
- Parser upgrades remain explicit dependency decisions rather than automatic semver ranges.
- Additional resource-exhaustion evidence may tighten fixed limits without broadening accepted
  syntax.

## Compatibility and migration

The package is private, and the parser feature is absent from its root export. This decision does
not change public Core, renderer, collection, Lotus, Lilium, or Aster consumer contracts.

Replacing the parser requires an adapter implementing `ISvgParser`, byte-identical success
semantics for accepted fixtures, stable Aster diagnostic semantics for rejected fixtures, and no
new declaration or dependency leakage.

## Evidence

- [Build package manifest](../../../packages/build/package.json)
- [SVG parser implementation](../../../packages/build/src/parser/runtime/svg.parser.ts)
- [Parser runtime conformance](../../../packages/build/tests/runtime/svg-parser.test.ts)
- [Architecture verification](../../../tooling/architecture/check-architecture.mjs)
- [Build SVG Parser documentation](../packages/build/parser/index.md)
