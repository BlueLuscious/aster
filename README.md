# Aster

Aster is a host-independent icon ecosystem for defining, validating, transforming,
cataloguing and distributing icon collections. Its canonical model is designed to
serve Lilium, Protea and other consumers without assigning framework ownership to
the icon source.

The repository is in foundation development and does not yet expose a stable
public package.

## Documentation

- [Documentation home](docs/en/index.md)
- [Project](docs/en/project/index.md)
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

Aster is licensed under the terms in [LICENSE](LICENSE).
