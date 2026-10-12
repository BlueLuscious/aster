# @luscious-garden/aster-import

Private host-independent inspection and adoption of external icon sources into portable Aster
definitions and editable TypeScript modules. Hosts own acquisition, review and persistence.

## Workspace usage

This package is private and has no public npm installation. Use it inside this checkout after the
[root workspace setup](../../README.md#development).

```ts
import { IconImport, iconImportFormats } from "@luscious-garden/aster-import";

const inspected = IconImport.inspect({
  format: iconImportFormats.svg,
  sourceId: "external/disc.svg",
  identity: { namespace: "example", name: "disc" },
  content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>',
});
```

Handle the result's success or diagnostics before further adoption.
The [API guide](../../docs/en/packages/import/api/index.md) owns staged usage and failure handling.

## Documentation

- [Package guide](../../docs/en/packages/import/index.md): contracts, adapters and host boundaries.
- [Private version history](../../docs/en/packages/import/releases/index.md): reviewed source changes, not public Releases.

## Licence

Software and documentation follow [ISC](LICENSE).
