# Core Release Notes

## 0.1.0-rc.1

Status: **Published on 22 September 2026**. This is the formal release candidate for the first
public `0.1.0`, not a previously supported release. No consumer migration is required.

Registry: [`@luscious-garden/aster-core@0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-core/v/0.1.0-rc.1)

Approved archive SHA-256: `FA4C247160BB9556ABE2F78EFD7DFAED2FBE33B72471A1710FA0608144DDB59B`.

**Compatible capability:** `@luscious-garden/aster-core` provides the dependency-free ES2022 ESM root with
`Icon.define()`, `Collection.define()`, portable contracts and types, immutable runtime
vocabularies, and `IconDefinitionError`. Definitions are validated, isolated and frozen at
construction. The approved import is `@luscious-garden/aster-core`; implementation subpaths are not public.

**Accepted limits:** Core does not render, parse source files, own a catalogue, or mutate
definitions after construction. Cross-definition uniqueness and collection-wide licence
completion belong to their respective aggregate boundaries. There is no CommonJS or legacy
build. See [Core](index.md), [Workflow](workflow.md), and [Quality](quality.md) for the contract
and evidence.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
