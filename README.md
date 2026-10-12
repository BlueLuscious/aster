# Aster

Aster provides immutable portable icon definitions, curated artwork, SVG rendering and catalogue
commands without assigning framework ownership to icon sources. The
[package guide](docs/en/packages/index.md) introduces the public packages and private Import compiler.

## Usage

Install icons and rendering:

```sh
pnpm add @luscious-garden/aster-icons @luscious-garden/aster-svg
```

```ts
import { ArrowLeft } from "@luscious-garden/aster-icons/arrow-left";
import { Svg } from "@luscious-garden/aster-svg";

const markup = Svg.render(ArrowLeft);
```

Use [Core](packages/core/README.md) to author definitions or [CLI](packages/cli/README.md) for
standalone catalogue commands. Each package guide links its independent version history;
[publication records](docs/en/project/publications/index.md) retain verified published combinations.

## Documentation

- [Documentation home](docs/en/index.md): canonical guides and their ownership.
- [Project](docs/en/project/index.md): purpose, workflows, policies and ecosystem relationships.
- [Packages](docs/en/packages/index.md): APIs, usage and version histories.
- [Collections](docs/en/collections/index.md): artwork, provenance and visual rules.
- [Future capabilities](docs/en/future-capabilities.md): proposals rather than current guarantees.

## Development

Use the runtime in [.node-version](.node-version) and the package manager pinned in
[package.json](package.json):

```sh
pnpm install --frozen-lockfile
pnpm run verify
```

[Repository tooling](docs/en/tooling/index.md) owns contributor commands and verification boundaries.

## Licence

Software and documentation follow [ISC](LICENSE). Marked BlueLuscious-owned artwork follows the
separate [artwork licence](packages/icons/ARTWORK-LICENCE.md); other artwork retains its declared terms.
