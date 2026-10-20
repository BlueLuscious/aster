# Icons Quality Baseline

Status: **Accepted**

This page owns the evidence method and a dated source snapshot for public Icons import evaluation
and emitted distribution. It is not a bundle-size promise, hardware-independent speed guarantee
or CI timing threshold. [Icons Quality](quality.md) owns correctness coverage.

## Reproduction

```sh
pnpm run benchmark:icons
```

The command builds Core and Icons, then reports five public import scenarios and the emitted
package shape. Shared probing, sampling, aggregation and distribution inspection belong to
[Performance Tooling](../../tooling/performance/index.md); this page does not define another
implementation or catalogue.

## Evidence model

Each import scenario runs in seven fresh direct Node processes. A disposable synchronous module
hook instruments emitted JavaScript beneath `packages/icons/dist`; its marker executes when each
package module evaluates. The probe records relative module sets, named exports, dynamic-import
time and complete process time without editing source or distribution files.

Core and Node internals are excluded from Icons module counts. Complete process time includes
Node startup, whereas the instrumented import interval measures the requested import and its
necessary dependencies. Neither value is a renderer or search benchmark.

## Source snapshot

A 19 October 2026 Windows x64 observation using Node `24.10.0`, TypeScript `5.9.3` and native
ES2022 ESM gives these evaluation sets:

| Public subpath | Named exports | Evaluated Icons modules |
| --- | --- | ---: |
| `/camera/outline` | `CameraOutline` | 5 |
| `/camera` | `CameraVariants` | 5 |
| `/collections/amellus` | `Amellus` | 31 |
| `/manifest` | `AsterCollectionManifest`, `AsterIconManifest` | 2 |
| `/dynamic` | `AsterCollectionLoaders`, `AsterIconLoaders` | 2 |

The Camera entries evaluate distinct facades but the same single Outline definition and three
shared authoring authorities. Equal counts do not mean equal module sets or prove that a larger
dictionary evaluates only one treatment. Compiled multi-treatment fixtures provide that separate
[isolation evidence](quality.md#source-synchronisation-evidence).

Amellus evaluates its facade, collection, three authoring authorities and 26 explicitly retained
members. Metadata discovery evaluates only `manifest/index.js` and `generated/manifest/index.js`;
loader-map discovery evaluates only `dynamic/index.js` and `generated/dynamic/index.js`. Neither
evaluates artwork until a definition is requested.

The same source snapshot emits:

- 95 JavaScript modules, totalling 90,827 unminified bytes;
- 95 declarations, totalling 28,334 bytes;
- 190 emitted files, totalling 119,161 bytes;
- ESM, `sideEffects: false` and Core as the only runtime dependency.

The package root and bare collection aggregate remain blocked. Snapshot counts and bytes are not
budgets; source, compiler or membership changes require fresh evidence rather than extrapolation.
[Packed conformance](quality.md#evidence-coverage) verifies the acquired payload, legal notices,
declarations and native execution. [Distribution costs](index.md#distribution-costs) owns the
separate acquisition, evaluation and bundle boundaries.

## Interpretation

Exact evaluated module sets establish isolation; elapsed time is supporting evidence influenced
by startup, host state and instrumentation. No timing optimisation follows from module counts
alone, and native ESM observations do not guarantee bundler tree shaking.

[Catalogue Source Tooling](../../tooling/catalogue/index.md) owns build-time checking and repair.
Those operations do not run when an installed consumer imports or renders an icon. Changes to
private generation and changes to consumer evaluation must be measured separately.
