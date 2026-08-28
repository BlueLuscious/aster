# Import Errors

`IconImportError` is the public deterministic `TypeError` raised for malformed API structure. It
contains stable code `ASTER-IMPORT-001` and the logical path that violated the contract.

Source syntax, safety, technical and reviewed-metadata failures are not exceptions; they use the
[diagnostic result boundary](../diagnostic/index.md). Internal SVG invariant errors never enter the
public package surface.

