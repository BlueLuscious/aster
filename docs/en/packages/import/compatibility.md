# Import Compatibility

Import is a private ES2022 ESM workspace package. Its source version tracks internal changes,
not external publication or a compatibility promise to registry consumers. The
[private history](releases/index.md) records accepted version boundaries.

## Distribution boundary

Only the [root API](api/index.md#composition-and-exports) is exported. Runtime classes, adapter and
parser contracts, validation evidence and implementation subpaths are private. Distribution emits
ESM JavaScript and declarations, without CommonJS, source maps, alternate targets, Node/DOM
ambient dependencies or parser token types in declarations.

Runtime dependencies are public `@luscious-garden/aster-core` through `workspace:^` and pinned
`xmlsax-typescript@1.0.0`, confined to the [SVG parser](formats/svg/parser/index.md). Import has no
Icons, SVG, CLI, repository-tooling, filesystem, framework or network dependency.

## Consumer independence

Core, Icons, SVG and CLI have no production dependency on Import. Editable modules depend only on
Core and remain usable with another renderer or without Import. Icons may retain reviewed emitted
content as ordinary authored source, not as an Import-owned generated artefact.

New source formats require private adapters and conformance; they do not imply plugin registration,
automatic discovery or binary-input support. Host acquisition and persistence remain separate.
[Quality](quality.md) owns ABI checks and independently compiled emitted-module evidence.
