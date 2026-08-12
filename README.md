# Aster

Aster is a host-independent icon ecosystem for defining, validating, transforming,
cataloguing and distributing icon collections. Its canonical model is designed to
serve Lilium, Lotus and other consumers without assigning framework ownership to
the icon source.

The repository is in foundation development and does not yet expose a stable
public package.

## Documentation

- [Documentation home](docs/en/index.md)
- [Architecture](docs/en/architecture/index.md)
- [Governance](docs/en/governance/index.md)
- [Repository tooling](docs/en/tooling/index.md)
- [Packages](docs/en/packages/index.md)
- [Collections](docs/en/collections/index.md)
- [Decision records](docs/en/decisions/index.md)

Canonical documentation is written in British English under `docs/en/`.

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

Aster is licensed under the terms in [LICENSE](LICENSE).
