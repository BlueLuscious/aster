# 0004: JSON Metadata for SVG Imports

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-07-29**

Affected documents:

- [Collection and Source Boundary](../architecture/collection-and-source-boundary.md)
- [Metadata and Identity Boundary](../architecture/metadata-and-identity-boundary.md)
- [Build Source](../packages/build/source/index.md)

Supersedes: **None**

Superseded by: **None**

## Context

Aster's SVG importer needs authored collection and icon metadata that can enter deterministic
builds without coupling portable Core values to a parser technology. This decision does not
require JSON or external metadata for TypeScript definitions authored directly against Core.

The SVG import boundary requires metadata that is human-editable, dependency-light, strict enough
for deterministic diagnostics, and replaceable behind Aster-owned structured contracts.

## Decision drivers

- No additional production dependency for the first metadata decoder.
- Deterministic parsing and exact source text.
- Explicit schema evolution.
- Familiar authored syntax with broad editor support.
- Separation between textual decoding and domain authority.
- Stable collection, icon, and variant counterpart relationships.

## Options

### JSON

JSON is available in ES2022, has one strict data model, needs no parser dependency, and supports
plain immutable structured values. It does not support comments and requires Aster-owned
validation for useful field diagnostics.

### TypeScript metadata modules

TypeScript metadata modules would provide expressive authoring and static types, but loading them
inside the SVG importer would execute code or require compiler tooling. This does not preclude
direct TypeScript-first icon definitions, which are a separate trusted authoring path.

### YAML

YAML provides concise authoring and comments, but introduces a parser dependency and a wider
syntax surface with implicit scalar and schema behaviour that Aster does not currently need.

## Decision

Collection and icon metadata acquired by the SVG importer use strict UTF-8 JSON with
`schemaVersion: 1`.

Within one explicitly selected source root, a collection owns `metadata/collection.json`. Each
icon owns `metadata/icons/<icon-slug>.json`; a separately represented variant owns
`metadata/icons/<icon-slug>--<variant-slug>.json`. The base filename must match its SVG import
counterpart.

JSON syntax is decoded behind an Aster-owned private Build service. Decoding produces Aster-owned
structured values and diagnostics; `JSON.parse` exceptions, implementation messages, mutable
objects, and parser details cannot cross that boundary. Unknown fields, invalid values, duplicate
JSON keys, unsupported schema versions, and identity disagreement are blocking source errors.

Metadata keys owned by Aster use British English. Externally standardised values retain their
required spelling. Detailed visual rationale remains in collection documentation rather than
being embedded as unstructured JSON prose.

## Consequences

### Positive

- Metadata decoding needs no additional production dependency.
- Exact metadata files are deterministic and straightforward to review.
- Schema versions provide an explicit migration boundary.
- Aster contracts remain independent from textual serialisation.
- Filesystem hosts can map SVG and metadata counterparts without evaluating code.

### Negative

- JSON cannot contain comments.
- Aster must detect duplicate keys independently because `JSON.parse` alone discards that evidence.
- Domain-friendly diagnostics require source-aware validation beyond native parse errors.
- Schema changes require explicit version and migration handling.

### Deferred

- Define whether generated JSON Schema files provide useful editor assistance.
- Evaluate a dedicated authoring UI only after collection workflows provide demand.

## Compatibility and migration

This is the first accepted SVG-import metadata serialisation and affects no released collection or
public runtime package. Version-one metadata may change through an explicit schema-version
migration before a compatibility-bearing importer release.

Replacing JSON for future sources or changing version-one field meanings requires a superseding
decision. Internal structured Build contracts may evolve independently when textual decoders adapt
without changing canonical metadata semantics.

## Evidence

- [Build Metadata](../packages/build/metadata/index.md)
- [Build Pipeline](../packages/build/pipeline/index.md)
- [Build SVG Normalisation](../packages/build/normalisation/index.md)
- [SVG Processing Pipeline](../architecture/svg-processing-pipeline.md)
