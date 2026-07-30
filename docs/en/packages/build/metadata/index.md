# Build Metadata

Status: **Experimental**

The metadata feature converts exact canonical JSON text into immutable collection and icon values
without exposing JSON representation to validation, normalisation, or generation. Version one is
a closed schema: unknown fields, unsupported versions, duplicate decoded keys, malformed JSON,
resource-limit failures, invalid values, and disagreement with independently acquired identity
are blocking source diagnostics.

## Internal contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IDecodedCollectionMetadata` | Carries accepted collection identity, package publication data, presentation policy, artwork authority, and visual validation configuration. | Produced by `IMetadataDecoder`; consumed by `CollectionBuildPipeline`. |
| `IMetadataDecoder` | Defines diagnostic-bearing collection and icon decoding independently of serialisation technology. | Implemented by `JsonMetadataDecoder`. |

`IIconMetadataValue` remains owned by
[Build Normalisation](../normalisation/index.md), because it is the representation required to
compose portable Core metadata.

## Internal types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `TJsonCursor` | Tracks bounded UTF-16 inspection progress through accepted JSON syntax. | Used by `JsonSyntaxInspector`. |
| `TJsonInspection` | Distinguishes accepted values from syntax, resource, or duplicate-key evidence. | Input to semantic decoding. |
| `TMetadataIssue` | Carries stable expected metadata rejection evidence. | Converted into source diagnostics by `MetadataDiagnosticFactory`. |

## Authorities and runtime

| Symbol | Responsibility |
| --- | --- |
| `metadataSchema` | Owns version-one fields, closed policies, and resource limits. |
| `metadataIssueKinds` | Owns metadata diagnostic discriminators. |
| `JsonSyntaxInspector` | Uses the platform strict JSON parser and a bounded source scan to detect duplicate decoded object keys. |
| `JsonMetadataDecoder` | Validates exact fields and values, preserves acquired identity authority, and freezes accepted values. |
| `MetadataDiagnosticFactory` | Maps expected failures to stable `ASTER-METADATA-*` diagnostics. |

## Diagnostics

| Code | Meaning |
| --- | --- |
| `ASTER-METADATA-001` | JSON is malformed or exceeds an accepted resource limit. |
| `ASTER-METADATA-002` | An object repeats the same decoded key. |
| `ASTER-METADATA-003` | A metadata object contains an unknown field. |
| `ASTER-METADATA-004` | The source declares an unsupported schema version. |
| `ASTER-METADATA-005` | Decoded identity disagrees with the independently acquired source identity. |
| `ASTER-METADATA-006` | A value violates its metadata or collection-rule contract. |

Diagnostics never expose native parser messages. Duplicate-key reports retain the exact second key
token span. The complete source owns reports for semantic failures without a trustworthy token
location.
