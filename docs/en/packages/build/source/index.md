# Build Source

Status: **Accepted**

The source feature represents canonical textual inputs after a host adapter has strictly decoded
bytes but before parser or semantic validation authority exists.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `CanonicalTextSource` | Carries an exact decoded string and canonical logical `sourceId`. | Base of every accepted textual source descriptor. |
| `CanonicalSvgSource` | Associates one canonical exported SVG string with an acquired icon identity. | Extends `CanonicalTextSource`; reuses Core `IconIdentity`. |
| `CollectionMetadataSource` | Associates textual collection metadata with its collection slug. | Extends `CanonicalTextSource`. |
| `IconMetadataSource` | Associates textual icon metadata with a complete acquired identity. | Extends `CanonicalTextSource`; reuses Core `IconIdentity`. |

## Types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `IngestionSourceType` | Forms the closed union of SVG, collection metadata, and icon metadata descriptors. | Accepted by pure ingestion stages. |

The metadata format is deliberately unspecified. Source services transport exact text and do not
choose JSON, YAML, TypeScript, or another schema representation.

`IconIdentity` belongs to `@aster/core` because collection, icon, and optional variant identity
have the same stable meaning throughout acquisition, generation, distribution, and rendering.
Source descriptors carry an acquired claim; their provenance does not require a structurally
duplicated contract.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IngestionSourceFactory` | Validates the closed source union, canonical source identifiers, strict text invariants, and identity slugs before cloning and freezing retained data. | Composes internal source ID and identity normalisers. |
| `SourceLocator` | Maps zero-based UTF-16 offsets to one-based lines and columns and creates exclusive spans. | Consumes `CanonicalTextSource`; produces diagnostic positions and spans. |
| `SourceIdNormaliser` | Enforces repository-relative `/`-separated logical identifiers without absolute, empty, current, or parent segments. | Shared by source and diagnostic factories. |
| `SourceIdentityNormaliser` | Enforces exact ASCII lowercase `kebab-case` source claims before freezing them. | Produces Core `IconIdentity` without importing Core runtime implementations. |

## Encoding and newline rules

- A host adapter must decode bytes as strict UTF-8 before invoking the pure domain service.
- A byte-order mark is rejected rather than removed implicitly.
- Unpaired UTF-16 surrogates are rejected because they cannot represent valid decoded UTF-8 text.
- LF, CRLF, mixed newlines, spacing, and the complete decoded code-unit sequence remain unchanged.
- Offsets count UTF-16 code units and end offsets are exclusive.
- CRLF counts as one logical line ending; columns count UTF-16 code units.

The factory does not infer a path from a machine filesystem, inspect directories, read
environment variables, or normalise newlines. A repository adapter may perform acquisition but
must pass logical identifiers and content explicitly.
