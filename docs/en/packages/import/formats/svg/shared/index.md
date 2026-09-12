# Import SVG Shared

SVG Shared owns the closed element, attribute, path-command, paint and numeric vocabularies used by
the parser, validator and normaliser. Runtime helpers parse strict finite numbers and inspect path
data; the internal SVG error represents impossible adapter states.

These authorities remain private because they describe accepted external SVG source rather than
portable Core values or public Import formats.

The shared internal types remain narrowly tied to those authorities:

- `TSvgSourceElementName` and `TSvgSourceElementRole` derive the closed supported element names
  and structural or primitive roles.
- `TSvgNumericDomain` and `TSvgPresentationNumericDomain` derive the finite numeric policies used
  by geometry and presentation validation.
- `TSvgPathCommand` derives the accepted path-command vocabulary.
- `TSvgPathSegment` retains one authored command, its casing and its immutable finite parameters.
- `TSvgPathInspection` contains immutable source segments and expanded operation-count evidence
  needed by validation and normalisation.

These types do not become portable path contracts. They retain SVG-specific commands such as
horizontal, vertical and smooth curves only long enough for normalisation to translate them into
Core's smaller absolute command vocabulary.
