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
```

The programmatic root returns complete immutable export and technical review plans and performs no
filesystem effect. The package includes deterministic self-contained review-document
serialisation behind its internal boundary. Only the standalone Node executable may publish
supported output plans beneath an explicit absent output root; static review publication is not
yet implemented.

See the [canonical package documentation](../../docs/en/packages/cli/index.md) for boundaries,
contracts, and implemented behaviour.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
