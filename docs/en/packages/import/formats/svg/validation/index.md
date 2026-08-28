# Import SVG Validation

Technical validation checks the view box, supported geometry, finite numeric domains, path data,
presentation and the closed attribute subset. Internal metric types retain located bounds,
numbers, stroke widths, primitive counts and path-command counts needed for review.

The editor-attribute validator recognises only the finite root policy. Safe discarded values emit
`ASTER-TECHNICAL-007` warnings with exact spans; malformed values remain errors. Collection visual
rules are intentionally outside Import.

## Internal contract

`ISvgValidationEntry` pairs the canonical SVG source with its parser-neutral document for one
technical validation pass.

## Internal types

- `TLocatedNumber`, `TLocatedBounds` and `TLocatedViewBox` retain validated numeric evidence with
  exact source locations.
- `TSvgGeometryNumericDomain` derives the numeric policies accepted by geometry attributes.
- `TSvgGeometryValidation`, `TSvgPresentationValidation`, `TSvgPrimitiveValidation` and
  `TSvgTechnicalValidation` form the successive immutable validation evidence shapes.
- `TSvgValidationMetrics` contains metadata-free primitive and path-command review facts returned
  to Adoption.
- `TSvgValidationIssue` is the discriminated internal failure evidence translated into stable
  diagnostics.
- `TSvgValidationDiagnosticDetails` augments shared diagnostic details with the stable severity
  owned by one validation issue family.
