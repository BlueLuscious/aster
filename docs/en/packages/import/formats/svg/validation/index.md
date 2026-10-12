# Import SVG Validation

Technical validation checks the view box, supported geometry, finite numeric domains, path data,
presentation and the closed attribute subset. It retains only the validated view box, primitive
count and expanded path-operation count consumed by the imported draft.

Validation receives only a complete parser-neutral document. The preceding
[parser trust boundary](../parser/index.md) owns XML capabilities, parser limits and exact lexical
source evidence; validation does not repeat those responsibilities.

The editor-attribute validator recognises only the finite root policy. Safe discarded values emit
`ASTER-TECHNICAL-007` warnings with exact spans; malformed values remain errors. Collection visual
rules are intentionally outside Import.

## Internal contract

`ISvgValidationEntry` pairs the canonical SVG source with its parser-neutral document for one
technical validation pass.

## Internal types

- `TSvgGeometryNumericDomain` derives the numeric policies accepted by geometry attributes.
- `TSvgGeometryValidation`, `TSvgPrimitiveValidation` and `TSvgTechnicalValidation` form the
  successive immutable validation evidence shapes. Presentation validation returns its canonical
  diagnostic sequence directly because it owns no additional result state.
- `TSvgValidationMetrics` contains metadata-free primitive and path-command review facts returned
  to Adoption.
- `TSvgValidationIssue` is the discriminated internal failure evidence translated into stable
  diagnostics.

Validation retains the portable Core `IconViewBox` directly. It owns no provisional visual grid,
stroke-width collection or primitive bounds: the neutral draft consumes only geometry and the
documented metrics. [Collection visual policy](../../../../../collections/index.md) and
[CLI review guides](../../../../cli/review/index.md) are independent consumers, not Import rules.
