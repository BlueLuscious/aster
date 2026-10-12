# Import Formats

`iconImportFormats` is the frozen runtime authority for built-in source discriminators; it
currently contains only `svg`. `IconImportFormatType` derives the same closed literal union and
tags [source](../source/index.md) and adoption provenance.

The private `IIconImportAdapter<Source>` pairs an exact format identity with inspection of its
accepted acquired source, returning `DiagnosticResultType<IconImportDraft>`. The immutable
registry is composed explicitly by the [API](../api/index.md), without plugin discovery or mutable
registration. An unknown discriminator is malformed invocation.

The [SVG adapter](../formats/svg/index.md) owns the initial implementation. Additional formats
require an actual source family and conformance against the same neutral draft boundary.
