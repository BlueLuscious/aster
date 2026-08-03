# @aster/cli

Host-neutral command contracts and execution for Aster.

The package exposes the frozen `AsterCommands` composition for deterministic `list`, `search`,
`show`, `help`, and `version` execution through explicit catalogue providers. `AsterCatalogue`
adapts the canonical `@aster/icons` definitions when a host opts into that provider.

The standalone Node package also exposes the `aster` executable:

```sh
pnpm exec aster list icons
pnpm exec aster search camera --json
pnpm exec aster show icon aster/camera
```

See the [canonical package documentation](../../docs/en/packages/cli/index.md) for boundaries,
contracts, and implemented behaviour.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
