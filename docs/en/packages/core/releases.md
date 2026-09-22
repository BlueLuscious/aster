# Core Release Notes

## 0.1.0 candidate

Status: **Not published**. This is the proposed first public version, not a previously supported
release. No consumer migration is required.

**Compatible capability:** `@aster/core` provides the dependency-free ES2022 ESM root with
`Icon.define()`, `Collection.define()`, portable contracts and types, immutable runtime
vocabularies, and `IconDefinitionError`. Definitions are validated, isolated and frozen at
construction. The approved import is `@aster/core`; implementation subpaths are not public.

**Accepted limits:** Core does not render, parse source files, own a catalogue, or mutate
definitions after construction. Cross-definition uniqueness and collection-wide licence
completion belong to their respective aggregate boundaries. There is no CommonJS or legacy
build. See [Core](index.md), [Workflow](workflow.md), and [Quality](quality.md) for the contract
and evidence.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
