# Import Compatibility

`@aster/import` is a private ES2022 ESM workspace package. It is not published and carries no
external compatibility promise while its first real host remains unimplemented.

## Dependencies

Import depends on the public root of `@aster/core` and pins `xmlsax-typescript` `1.0.0` behind its
private SVG parser boundary. It does not depend on Icons, SVG, CLI, repository tooling, Node, DOM,
framework or filesystem APIs.

The parser dependency is an implementation choice rather than part of the package ABI. Its token
types, failures and messages remain private, and the [SVG parser authority](formats/svg/parser/index.md)
defines the stable Aster-owned safety and source-evidence behaviour.

The package exports one root only. Runtime values are limited to `IconImport`, `IconImportError`
and `iconImportFormats`; contracts and types are declaration-only exports. Parser, adapter,
validation, normalisation and runtime implementation subpaths are inaccessible through package
exports.

The emitted private distribution contains only ES2022 ESM `.js` modules and `.d.ts` declarations.
It emits no CommonJS, source maps, alternate targets, Node or DOM declarations. Runtime modules may
reference only the public `@aster/core` root and the exact private parser dependency; declarations
remain host-neutral and do not expose parser types.

## Consumer independence

Core, Icons, SVG and CLI have no production dependency on Import. Import may consume Core, but it
cannot reverse that direction. Emitted modules depend only on Core and can be consumed by SVG or
another render target independently from Import.

Icons may retain a reviewed emitted module as ordinary human-owned `.icon.ts` source, but Import
does not generate the Icons package, infer collection membership or remain in its distribution.
TypeScript-first definitions and collections therefore remain fully usable when Import is absent.

An additional source format requires an internal adapter and conformance evidence. It does not
imply mutable registration, automatic discovery, a third-party plugin ABI or support for binary
input. Those boundaries require separate evidence and an explicit package decision.
