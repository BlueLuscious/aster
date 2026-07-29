# Build SVG Validation

Status: **Accepted**

The validation feature converts parser-safe but untrusted SVG syntax into complete internal
evidence for normalisation. It keeps universal technical validity separate from collection-owned
visual rules and never claims to automate artistic judgement.

The feature is internal to `@aster/build`. Its classes, contracts, types, configuration, and
evidence are absent from the package root export.

## Validation unit

One `ISvgValidationUnit` contains:

- one required `CollectionMetadataSource` establishing collection identity;
- one or more `ISvgValidationEntry` values pairing canonical SVG with parsed syntax;
- independently acquired `IconMetadataSource` values awaiting counterpart resolution;
- one immutable `ICollectionValidationContract` created through
  `CollectionValidationContractFactory`.

Acquisition order has no semantic authority. Successful evidence orders entries by collection,
icon, and optional variant identity.

Metadata content remains exact opaque text because metadata serialisation is still an independent
open technology decision. This stage validates required source presence, acquired identity, and
pairing. It does not invent a metadata schema or treat unparsed content as accepted runtime
metadata.

## Internal contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `ISvgValidator` | Applies universal and collection-owned validation to one complete unit. | Implemented by `SvgValidator`; returns `DiagnosticResultType<ISvgValidationEvidence>`. |
| `ISvgValidationUnit` | Groups collection metadata, acquired entries, and accepted collection authority. | Input to `ISvgValidator`. |
| `ISvgValidationEntry` | Pairs one canonical SVG with its parser-safe syntax document. | Validated technically while metadata counterparts are resolved independently. |
| `IPairedSvgValidationEntry` | Resolves one SVG entry to exactly one metadata source with the same identity. | Exists internally when counterpart resolution is unambiguous. |
| `ISvgValidationEvidence` | Carries collection authority and canonically ordered accepted entries. | Exists only when no blocking diagnostic occurs. |
| `IValidatedSvgEntry` | Adds deterministic technical metrics to an accepted source pair. | Entry of `ISvgValidationEvidence`; input to later normalisation. |
| `ICollectionValidationContract` | Owns the configured collection visual rules. | Composes the five optional rule contracts. |
| `ICollectionViewBoxRule` | Declares an expected Core `IconViewBox` and enforcement authority. | Produces `ASTER-COLLECTION-001` on disagreement. |
| `ICollectionStrokeRule` | Declares accepted explicit source stroke widths. | Produces `ASTER-COLLECTION-002` on disagreement. |
| `ICollectionGridRule` | Declares one positive provisional construction step. | Produces `ASTER-COLLECTION-003` for off-grid authored geometry. |
| `ICollectionBoundsRule` | Declares non-negative nominal safe-area insets. | Produces `ASTER-COLLECTION-004` for measurable primitive overshoot. |
| `ICollectionComplexityRule` | Declares provisional primitive and path-command limits. | Produces `ASTER-COLLECTION-005` when a limit is exceeded. |

## Internal types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `TCollectionRuleSeverity` | Restricts collection rule authority to `warning` or `error`. | Used by every collection rule contract. |
| `TLocatedNumber` | Associates one parsed finite number with exact attribute evidence. | Supplies grid and stroke facts. |
| `TLocatedBounds` | Associates exact non-path primitive bounds with source evidence. | Supplies safe-area facts. |
| `TLocatedViewBox` | Associates one valid Core `IconViewBox` with its exact authored span. | Prevents coordinate values and evidence from diverging. |
| `TSvgValidationMetrics` | Composes located viewBox, primitive, command, grid, stroke, and bounds facts. | Retained by `IValidatedSvgEntry`. |
| `TSvgValidationIssue` | Represents stable internal evidence for one diagnostic family. | Mapped by `SvgValidationDiagnosticFactory`. |
| `TSvgTechnicalValidation` | Carries technical diagnostics and safely computed metrics. | Output of `SvgTechnicalValidator`. |
| `TSvgIdentityValidation` | Carries identity diagnostics and unambiguous SVG-to-metadata pairs. | Output of `SvgIdentityValidator`. |
| `TSvgGeometryValidation` | Carries hierarchy-wide geometry diagnostics and metrics. | Output of `SvgGeometryValidator`. |
| `TSvgPrimitiveValidation` | Carries one primitive family's diagnostics and metrics. | Shared by concrete primitive validators. |
| `TSvgPresentationValidation` | Carries presentation diagnostics and valid explicit stroke widths. | Output of `SvgPresentationValidator`. |
| `TSvgGeometryNumericDomain` | Restricts geometry attributes to finite, positive, or non-negative numeric domains. | Used by `SvgGeometryNumberReader`. |
| `TSvgValidationDiagnosticDetails` | Extends common diagnostic details with occurrence-specific severity. | Internal return type of `SvgValidationDiagnosticFactory`. |

## Feature-owned authorities

| Authority | Responsibility |
| --- | --- |
| `svgValidationIssueKinds` | Defines every internal validation evidence discriminator. |

This authority remains feature-specific because it describes technical validation evidence rather
than general source acquisition or portable Core data. Number and path grammar are transversal
Build authorities documented by [Build Shared Authorities](../shared/index.md).

## Universal validation

Universal checks are not configurable by collections:

| Responsibility | Accepted behaviour |
| --- | --- |
| Identity | Collection metadata, collection contract, SVG identity, icon metadata identity, syntax source, and canonical SVG path agree. |
| Duplicate identity | A logical collection, icon, and optional variant occurs once per generation unit. |
| `viewBox` | Exactly four finite numbers are required; width and height are positive. |
| Attributes | Only accepted root, group, primitive, and portable presentation attributes are admitted. |
| Numbers | Geometry values use the strict finite SVG number grammar and their declared positive or non-negative domain. |
| Points | Polyline and polygon sequences contain complete finite pairs and their required minimum point count. |
| Path data | Commands and repeated parameter groups follow the accepted path grammar; arc radii and flags are valid; a drawing operation exists. |
| Presentation | Paint, fill rule, stroke geometry, and opacity use the closed portable value sets; overall opacity is forbidden on structural roots and groups. |
| Geometry | At least one supported non-empty primitive exists. |
| Transforms | Remain unsupported technical errors at the parser boundary; collection configuration cannot weaken this rule. |

Technical invalidity always blocks evidence and later normalisation. Independent safe checks
continue so callers receive all trustworthy diagnostics rather than only the first failure.

Overall opacity on a structural `svg` or `g` element is blocking because group compositing cannot
be preserved by flattening opacity onto individual overlapping primitives. Other accepted
inherited presentation fields remain structurally resolvable.

## Collection validation

Collection rules are optional and disabled when absent from the accepted contract.
`CollectionValidationContractFactory` validates their exact fields, numeric domains, unique stroke
widths, canonical collection identity, and explicit severity before they gain authority.

The default architectural meaning of a visual rule is advisory. A collection may assign `error`
only when its accepted design contract has evidence for a blocking consistency requirement.
Either severity remains a Collection diagnostic; safety and technical categories cannot be
reconfigured.

The provisional checks have deliberate limits:

- stroke checks inspect valid explicitly authored `stroke-width` values;
- grid checks inspect valid geometry values, including supported path coordinate and size values;
- bounds checks use exact circles, ellipses, rectangles, lines, polylines, and polygons;
- path curve bounds are not approximated or presented as exact;
- complexity counts supported primitives and explicitly authored path commands.

These checks expose drift. They do not score beauty, recognisability, balance, visual weight,
semantic clarity, cultural interpretation, or optical quality.

## Diagnostics

| Code | Category | Meaning |
| --- | --- | --- |
| `ASTER-SYNTAX-002` | Syntax | Missing or invalid `viewBox`. |
| `ASTER-SYNTAX-003` | Syntax | Geometry number, domain, or point sequence is invalid. |
| `ASTER-SYNTAX-004` | Syntax | Path data is invalid or contains no drawing operation. |
| `ASTER-SYNTAX-005` | Syntax | Portable presentation value is invalid. |
| `ASTER-TECHNICAL-005` | Technical | An attribute is outside the accepted portable subset. |
| `ASTER-TECHNICAL-006` | Technical | Supported non-empty geometry is absent. |
| `ASTER-TECHNICAL-007` | Technical | Acquired collection, path, syntax, SVG, or metadata identity disagrees. |
| `ASTER-TECHNICAL-008` | Technical | A canonical identity is duplicated in one unit. |
| `ASTER-COLLECTION-001` | Collection | The viewBox differs from the collection contract. |
| `ASTER-COLLECTION-002` | Collection | An explicit stroke width differs from the collection contract. |
| `ASTER-COLLECTION-003` | Collection | Authored geometry is off the collection grid. |
| `ASTER-COLLECTION-004` | Collection | Exact measurable bounds cross the nominal safe area. |
| `ASTER-COLLECTION-005` | Collection | Provisional source complexity is exceeded. |

Duplicate identities include deterministic related evidence for the first occurrence. All reports
use the canonical ordering and deduplication owned by
[Build Diagnostic](../diagnostic/index.md).

## Runtime composition

| Class | Responsibility |
| --- | --- |
| `SvgValidator` | Composes semantic, technical, and collection checks and returns all-or-nothing evidence. |
| `SvgIdentityValidator` | Verifies required metadata pairing, canonical paths, identity agreement, and duplicates. |
| `SvgTechnicalValidator` | Composes universal viewBox, geometry, and presentation validation. |
| `SvgGeometryValidator` | Traverses hierarchy and delegates primitive families while preserving source order. |
| `SvgBasicShapeValidator` | Validates circles, ellipses, rectangles, and lines and computes exact bounds. |
| `SvgPointSequenceValidator` | Validates polyline and polygon point pairs and computes exact bounds. |
| `SvgPathValidator` | Validates one path and exposes path advisory facts without rewriting data. |
| `SvgPresentationValidator` | Applies the closed portable presentation schema. |
| `SvgGeometryNumberReader` | Applies shared numeric domains without masking malformed authored values as defaults. |
| `SvgCollectionValidator` | Applies only rules present in the accepted collection contract. |
| `CollectionValidationContractFactory` | Creates deeply immutable collection rule authority from unknown input. |
| `SvgValidationDiagnosticFactory` | Maps internal validation evidence to stable Aster diagnostics. |

On success, `SvgValidator` returns complete deeply immutable evidence and zero or more warnings. A
technical error or collection rule promoted to `error` returns diagnostics without evidence.
