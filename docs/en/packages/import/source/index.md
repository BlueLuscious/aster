# Import Source

`SvgIconImportSource` is the first public acquired-source contract. It contains an exact `svg`
discriminator, host-owned logical `sourceId`, independently assigned portable identity and exact
decoded content. `IconImportSourceType` is the discriminated union consumed by the API.

The identity requires an explicit treatment slug, following
[Core identity rules](../../core/definition/index.md#identity-rules). Import does not classify
geometry as Outline or supply a treatment when it is missing.

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

## Explicit treatment migration

Apply the [Core identity rules](../../core/definition/index.md#identity-rules)
to acquired source identities and stored drafts, including reviewed replacement metadata.
Omitting the treatment is rejected rather than classified from SVG. After reviewing earlier
editable modules, update their construction data and references deliberately; Import does not
rewrite persisted source. [Editable emission](../adoption/index.md#editable-emission) owns the
treatment-bearing symbol and suggested path for newly emitted modules.
