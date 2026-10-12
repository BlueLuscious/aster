# @luscious-garden/aster-cli

Catalogue discovery, SVG export and static review through host-neutral command plans and the
standalone `aster` Node executable.

## Usage

The executable supports Node `>=24.10.0 <25`; either installation brings compatible Core, Icons
and SVG dependencies.

### Project installation

```sh
pnpm add -D @luscious-garden/aster-cli
pnpm exec aster list icons
pnpm exec aster export icon aster/camera
pnpm exec aster version --all
```

### Global installation

```sh
pnpm add -g @luscious-garden/aster-cli
aster list icons
aster export icon aster/camera
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

## Documentation

- [Package guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/index.md): features, providers and host boundaries.
- [Version history](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/releases/index.md): changes and migrations.

## Licence

Software and documentation follow [ISC](LICENSE).
