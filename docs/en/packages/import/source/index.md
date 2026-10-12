# Import Source

`SvgIconImportSource` is the first public acquired-source contract. It contains an exact `svg`
discriminator, host-owned logical `sourceId`, independently assigned portable identity and exact
decoded content. `IconImportSourceType` is the discriminated union consumed by the API.

Import rejects absolute paths, parent segments, backslashes and control characters in logical
source identifiers. Content must be decoded text without a leading byte-order mark or isolated
UTF-16 surrogate.
Import does not normalise accepted text. Invalid source envelopes throw
[`IconImportError`](../error/index.md) before format inspection. Canonical parser source and
source-location contracts remain internal.

[Diagnostic positions](../diagnostic/index.md) refer to exact unnormalised UTF-16 text.
The SVG parser owns [resource limits and located evidence](../formats/svg/parser/index.md).

`ICanonicalTextSource` carries isolated source text and logical provenance inside Import.
`ICanonicalSvgSource` extends it with the SVG discriminator and independently acquired icon
identity used by the private SVG adapter.
