# Import Errors

`IconImportError` is the public deterministic `TypeError` raised for malformed API structure. It
contains stable code `ASTER-IMPORT-001` and the logical path that violated the contract.

An unknown format discriminator is malformed invocation rather than source rejection because
`IconImportSourceType` is a closed built-in source union. It therefore throws `IconImportError` at
`source.format`; syntactically valid source in a supported format returns diagnostics when its
content is unsafe, unsupported or invalid.

Source syntax, safety, technical and reviewed-metadata failures are not exceptions; they use the
[diagnostic result boundary](../diagnostic/index.md). Internal SVG invariant errors never enter the
public package surface.

Caller-controlled failures preserve their original identity. `IconImportError` messages contain
only the stable Aster code, logical value path and Aster-owned invariant explanation; native parser
or host error text is never appended.
