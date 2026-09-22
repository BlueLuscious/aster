# Aster

Aster is a host-independent icon ecosystem for defining, validating, transforming,
cataloguing and distributing icon collections. Its canonical model is designed to
serve Lilium, Protea and other consumers without assigning framework ownership to
the icon source.

The repository is in pre-release development. Core, Icons, SVG and CLI publish their first
`0.1.0-rc.1` release candidates through the `@luscious-garden` npm scope.

## Pre-release consumption

Install the exact candidate versions for canonical icons and SVG rendering:

```sh
pnpm add @luscious-garden/aster-icons@0.1.0-rc.1 @luscious-garden/aster-svg@0.1.0-rc.1
```

```ts
import { ArrowLeft } from "@luscious-garden/aster-icons/arrow-left";
import { Svg } from "@luscious-garden/aster-svg";

const markup = Svg.render(ArrowLeft);
```

Authoring a new definition directly requires `@luscious-garden/aster-core`; the standalone CLI can be installed
with `pnpm add -D @luscious-garden/aster-cli@0.1.0-rc.1` and run with `pnpm exec aster list icons` on Node
`>=24.10.0 <25`. The [publication record](docs/en/project/publication.md) preserves the release
controls and evidence for these packages.

## Documentation

- [Documentation home](docs/en/index.md)
- [Project](docs/en/project/index.md)
- [Publication procedure](docs/en/project/publication.md)
- [Repository tooling](docs/en/tooling/index.md)
- [Packages](docs/en/packages/index.md)
- [Collections](docs/en/collections/index.md)
- [Future capabilities](docs/en/future-capabilities.md)
- [Garden ecosystem](https://github.com/BlueLuscious/garden)

Canonical documentation is written in British English under `docs/en/`.
Garden owns Aster's cross-product identity and ecosystem relationships; this repository remains
authoritative for Aster's implementation, packages, collections, workflows, and releases.

## Development

The supported development runtime is declared in [.node-version](.node-version)
and the workspace requires pnpm.

```sh
pnpm install --frozen-lockfile
pnpm run verify
```

Run the standalone documentation validation with:

```sh
pnpm run check:docs
```

## Licence

Aster's software and documentation are licensed under [ISC](LICENSE). BlueLuscious-owned icon and
collection artwork identified by its metadata follows the separate
[artwork licence](packages/icons/ARTWORK-LICENCE.md); other artwork retains its declared terms.
