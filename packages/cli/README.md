# @luscious-garden/aster-cli

Catalogue discovery, SVG export and static review through host-neutral command plans and the
standalone `aster` Node executable.

## Usage

```sh
pnpm add -D @luscious-garden/aster-cli
```

The executable supports Node `>=24.10.0 <25`; installation brings compatible Core, Icons and SVG
dependencies.

```sh
pnpm exec aster list icons
pnpm exec aster export icon aster/camera
pnpm exec aster version --all
```

A project installation normally needs the package manager's execution command, a package script
or an explicit local binary path. Bare `aster` requires an executable in the shell's command search
path. The [shell guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/shell/index.md)
owns these invocation alternatives, command grammar, version sources and failure behaviour.

For a custom host, the public `AsterCommands` composition returns command results and plans without
filesystem effects. The [programmatic API](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/api/index.md)
owns contexts and execution contracts.

## Documentation

- [Package guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/index.md): features, providers and host boundaries.
- [Version history](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/releases/index.md): changes and migrations.

## Licence

Software and documentation follow [ISC](LICENSE).
