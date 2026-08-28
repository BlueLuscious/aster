# Import Compatibility

`@aster/import` is a private ES2022 ESM workspace package. It is not published and carries no
external compatibility promise while its first real host remains unimplemented.

## Dependencies

Import depends on the public root of `@aster/core` and pins `xmlsax-typescript` `1.0.0` behind its
private SVG parser boundary. It does not depend on Icons, SVG, CLI, repository tooling, Node, DOM,
framework or filesystem APIs.

The package exports one root only. Runtime values are limited to `IconImport`, `IconImportError`
and `iconImportFormats`; contracts and types are declaration-only exports. Parser, adapter,
validation, normalisation and runtime implementation subpaths are inaccessible through package
exports.

## Consumer independence

Core, Icons, SVG and CLI have no production dependency on Import. Import may consume Core, but it
cannot reverse that direction. Emitted modules depend only on Core and can be consumed by SVG or
another render target independently from Import.

An additional source format requires an internal adapter and conformance evidence. It does not
imply mutable registration, automatic discovery, a third-party plugin ABI or support for binary
input. Those boundaries require separate evidence and an explicit package decision.
