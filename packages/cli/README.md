# @luscious-garden/aster-cli

Catalogue discovery, SVG export and static review through host-neutral command plans and the
standalone `aster` Node executable.

## Usage

Examples follow the [current source contract](https://github.com/BlueLuscious/aster/blob/master/docs/en/index.md#source-and-published-versions).

The executable supports Node `>=24.10.0 <25`; either installation brings compatible Core, Icons
and SVG dependencies.

### Project installation

```sh
pnpm add -D @luscious-garden/aster-cli
pnpm exec aster list glyphs
pnpm exec aster show glyph aster/camera
pnpm exec aster list icons --glyph aster/camera
pnpm exec aster export icon aster/camera@outline
pnpm exec aster version --all
```

### Global installation

```sh
pnpm add -g @luscious-garden/aster-cli
aster list glyphs
aster show glyph aster/camera
aster list icons --glyph aster/camera
aster export icon aster/camera@outline
aster version --location
```

Local and global installations are independent. Bare `aster` uses the shell's command search
path, not necessarily the project's CLI. `--location` identifies the CLI that ran without
changing its selection. The [shell guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/shell/index.md#installation-and-invocation)
owns global executable setup, local alternatives, command grammar, version sources and failures.

## Programmatic usage

For a custom host, the public `AsterCommands` composition returns command results and plans without
filesystem effects. The [programmatic API](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/api/index.md)
owns contexts and execution contracts.

Glyph commands discover available treatments without loading artwork. Concrete icon operations
require `@variant`; the
[Catalogue guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/catalogue/index.md#discovery-semantics)
explains provider scope and exact family filtering.

The [identity migration](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/catalogue/index.md#explicit-treatment-migration)
explains how to update earlier icon requests and providers.

## Documentation

- [Package guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/index.md): features, providers and host boundaries.
- [Version history](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/releases/index.md): changes and migrations.

## Licence

Software and documentation follow [ISC](LICENSE).
