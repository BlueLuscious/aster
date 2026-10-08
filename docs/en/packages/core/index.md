# Portable Icon Core

Status: **Accepted**

`@luscious-garden/aster-core` owns Aster's serialisable, target-independent icon and collection
model. Source adapters, icon packages and renderers exchange these values without importing
parser syntax, DOM objects, framework state or repository tooling.

## Boundary

Core constructs plain deeply frozen data through `Icon.define()` and `Collection.define()`.
It has no runtime dependencies, renderer, catalogue, registry or global identity authority.
Consumers depend on Core; Core never depends on a target or consumer.

The package is native ES2022 ESM with `sideEffects: false`. Its production declarations use no
Node, DOM, browser or framework ambient types. These properties support static consumer analysis
without promising a particular bundler's tree-shaking result.

## Documentation

| Page | Owns |
| --- | --- |
| [API](api/index.md) | Construction signatures, usage and exact public exports. |
| [Collection](collection/index.md) | Collection identity, typed aliases, ordered membership and canonical retention. |
| [Definition](definition/index.md) | Icon identity, viewBox and complete portable shape. |
| [Definition Runtime](definition/runtime/index.md) | Icon construction and normaliser composition. |
| [Node](node/index.md) | Geometry primitives, structured path commands and their validation. |
| [Metadata](metadata/index.md) | Display, intrinsic tags, licensing, deprecation and RTL policy. |
| [Presentation](presentation/index.md) | Paint fields, technical defaults and override precedence. |
| [Render Options](render/index.md) | Portable caller intent interpreted by target renderers. |
| [Shared Runtime](shared/index.md) | Common data acceptance and deterministic Core errors. |
| [Workflow](workflow.md) | Construction hand-offs and the security and trust boundary. |
| [Quality](quality.md) | Runtime, type, ABI and consumer conformance evidence. |
| [Quality Baseline](quality-baseline.md) | Package scenarios, historical measurements and comparison decisions. |
| [Releases](releases/index.md) | Published versions and migrations. |

The [package dependency graph](../index.md) owns ecosystem relationships; the
[project publication procedure](../../project/publication.md) owns registry checks and approval.
