# @aster/cli

Host-neutral command contracts and execution for Aster.

The package exposes the frozen `AsterCommands` composition for deterministic `export`, `review`,
`list`, `search`, `show`, `help`, and `version` execution through explicit catalogue providers.
`AsterCatalogue` adapts the canonical `@aster/icons` definitions when a host opts into that
provider.

The standalone Node package also exposes the `aster` executable:

```sh
pnpm exec aster list icons
pnpm exec aster search camera --json
pnpm exec aster show icon aster/camera
pnpm exec aster export icon aster/camera
pnpm exec aster export collection aster --output ./icons
pnpm exec aster review icon aster/camera --json
pnpm exec aster review collection aster --output ./aster-review
```

The programmatic root returns complete immutable export and technical review plans and performs no
filesystem effect. The standalone Node executable serialises and publishes self-contained review
HTML to `aster-review` by default or to an explicit output root. Existing owned review output can
be replaced only through the explicit `--replace` option.

See the [canonical package documentation](../../docs/en/packages/cli/index.md) for boundaries,
contracts, and implemented behaviour.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
