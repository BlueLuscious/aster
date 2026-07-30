# 0007: TypeScript-first Aster Collection Package

Status: **Accepted**

Owners: **Technical maintainers and Aster collection curator**

Date: **2026-07-30**

Affected documents:

- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [Distribution and Adapters](../architecture/distribution-and-adapters.md)
- [Aster Collection Authoring Workflow](../collections/aster/authoring-workflow.md)
- [`@aster/icons`](../packages/icons/index.md)

Supersedes: **None**

Superseded by: **None**

## Context

Core supports direct portable TypeScript definitions, Build supports SVG+JSON import into the same
model, and the SVG package provides deterministic target markup. The first collection needs one
canonical icon authority and one distribution package before representative artwork can be
reviewed as product source.

TypeScript and SVG+JSON evidence produced equivalent portable definitions. SVG output cannot
retain the complete runtime metadata and source authority, while SVG import requires separate
identity-aligned metadata and cannot reconstruct vector-tool masters or discarded source
formatting.

## Decision drivers

- Keep canonical geometry, identity, runtime metadata, and presentation policy reviewable
  together.
- Preserve Build as a reusable optional importer rather than a mandatory authoring dependency.
- Keep collection definitions portable and independent from renderers and frameworks.
- Provide isolated per-icon imports and exact export-map protection.
- Keep icon identity and values independent from collection membership.
- Avoid committing derived SVG or provisional source trees without generated ownership.

## Options

### TypeScript-first collection package

Each icon can own one authored `Icon.define(...)` module. Deterministic SVG remains derived review
output, and imported artwork can be deliberately adopted into the authored representation.

### SVG-first collection source root

Each icon can own reviewed SVG geometry and separate JSON metadata, with Build producing generated
TypeScript modules. This supports vector-tool output naturally but requires an effectful host and
generated package transaction not needed by the pilot.

### Dual canonical sources

TypeScript and SVG could both be editable authorities. Their inevitable disagreement would make
correction ownership, diffs, metadata, and release provenance ambiguous.

## Decision

The Experimental `aster` collection uses TypeScript-first authoring in the public
`@aster/icons` package.

The package:

- contains one canonical portable module per icon or explicit variant;
- delegates immutable construction to public `@aster/core`;
- depends only on `@aster/core` in production;
- exports a convenience root, one explicit subpath per icon, and one explicit collection subpath;
- keeps per-icon modules independent from siblings, manifests, renderers, frameworks, Build, host
  APIs, and repository tooling;
- centralises repeated icon-authoring viewBox, presentation, licence, attribution, and size values
  in one internal immutable authority;
- defines `AsterCollection` separately through `Collection.define(...)` and retains canonical icon
  values without changing their identities;
- treats SVG rendered through `@aster/svg` as derived and non-canonical;
- permits external SVG+JSON artwork to pass through Build only as an optional adoption path.

The first package version is Experimental and does not imply an Active or release-quality
collection.

## Consequences

### Positive

- One source diff contains the complete portable runtime authority.
- Per-icon modules remain tree-shakable and host independent.
- SVG review is deterministic and cannot silently replace authored metadata.
- Build retains value for external imports and future SVG-first collections.

### Negative

- Complex free-form drawing is less direct than editing vector artwork.
- Contributors must express accepted geometry through the portable primitive model.
- Design-tool interchange is observational rather than a lossless round trip.
- The root export grows with the collection, although direct subpaths remain isolated.

### Deferred

- Persistent generated SVG needs its own output root, cleanup owner, rebuild command, and
  verification.
- Search aliases, collection-specific taxonomy, or catalogue manifests require a real discovery
  consumer.
- A CLI remains conditional on a real user-facing SVG-import workflow.
- Variant subpaths remain absent until the collection accepts a variant.

## Compatibility and migration

The package begins at `0.0.0` and has no stable external compatibility promise. Its canonical
collection and icon identities remain independent and follow the project identity contract.

Changing the package name, canonical authoring authority, dependency direction, or per-icon
subpath model requires a superseding decision. Adding an icon is additive; removing or renaming a
released icon follows collection versioning and deprecation policy.

## Evidence

- [Canonical icon modules](../../../packages/icons/src/icons/index.ts)
- [Canonical Aster collection](../../../packages/icons/src/collections/aster.collection.ts)
- [Shared icon-authoring authority](../../../packages/icons/src/shared/constants/aster-icon-authoring.constant.ts)
- [Package ABI conformance](../../../packages/icons/tests/abi/package-abi.test.mjs)
- [Cross-package authoring workflow](../../../tests/workflow/pilot-authoring-workflow.test.ts)
- [Pilot reference set](../collections/aster/reference-set.md)
