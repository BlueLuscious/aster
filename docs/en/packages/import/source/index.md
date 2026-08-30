# Import Source

`SvgIconImportSource` is the first public acquired-source contract. It contains an exact `svg`
discriminator, host-owned logical `sourceId`, independently assigned portable identity and exact
decoded content. `IconImportSourceType` is the discriminated union consumed by the API.

Import rejects absolute paths, parent segments, backslashes and control characters in logical
source identifiers. It rejects byte-order marks and malformed Unicode without normalising source
bytes. Canonical parser source and source-location contracts remain internal.

Source offsets are zero-based UTF-16 code-unit offsets. Diagnostic lines and columns are one-based,
preserve the caller's exact text and treat LF or CRLF as one line break. The SVG parser owns the
[accepted limits and source-evidence policy](../formats/svg/parser/index.md).

`ICanonicalTextSource` carries isolated source text and logical provenance inside Import.
`ICanonicalSvgSource` extends it with the SVG discriminator and independently acquired icon
identity used by the private SVG adapter.
