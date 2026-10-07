# @luscious-garden/aster-cli

Host-neutral command contracts and execution for Aster.

The package exposes the frozen `AsterCommands` composition for deterministic `export`, `review`,
`list`, `search`, `show`, `help`, and `version` execution through explicit catalogue providers.
`AsterCatalogue` adapts canonical `@luscious-garden/aster-icons` manifests for discovery and loads only an exact
icon or collection definition when a host executes Export or Review through that provider.

The standalone Node package also exposes the `aster` executable:

```sh
pnpm add -D @luscious-garden/aster-cli@0.1.0-rc.2
```

The executable supports Node `>=24.10.0 <25`; installation brings compatible Core, Icons and SVG
packages.

```sh
pnpm exec aster list icons
pnpm exec aster search camera --json
pnpm exec aster show icon aster/camera
pnpm exec aster export icon aster/camera
pnpm exec aster export collection amellus --output ./icons
pnpm exec aster review icon aster/camera --json
pnpm exec aster review collection amellus --output ./aster-review
pnpm exec aster version
```

Plain `aster version` reports the installed CLI version. The `0.1.0-rc.2` candidate also accepts
these local, offline package queries:

```sh
pnpm exec aster version core
pnpm exec aster version icons --json
pnpm exec aster version --all
```

Core, Icons, SVG and `--all` inspect direct project installations; `version` and `version cli`
describe the CLI actually running. `--deps` groups each selected package with its direct installed
Aster dependencies, while `--location` identifies the executed CLI module. None queries the
registry. These queries are **not** available in the earlier `0.1.0-rc.1` candidate. A project-only
CLI normally needs `pnpm exec aster`, a package script, or an explicit local binary path; bare
`aster` needs a command resolvable by the shell. See the
[CLI Shell documentation](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/shell/index.md)
for their exact output and failure behaviour.

The programmatic root returns complete immutable export and technical review plans and performs no
filesystem effect. The standalone Node executable serialises and publishes self-contained review
HTML to `aster-review` by default or to an explicit output root. Existing owned review output can
be replaced only through the explicit `--replace` option.

See the [canonical package documentation](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/index.md) and
[initial release notes](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/cli/releases.md) for boundaries,
contracts, and implemented behaviour.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
