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

A 28 October 2026 Windows x64 observation using Node `24.10.0`, TypeScript `5.9.3` and native
ES2022 ESM gives these evaluation sets:

| Public subpath | Named exports | Evaluated Icons modules |
| --- | --- | ---: |
| `/camera/outline` | `CameraOutline` | 5 |
| `/camera` | `CameraVariants` | 8 |
| `/collections/amellus` | `Amellus` | 32 |
| `/manifest` | `AsterCollectionManifest`, `AsterIconManifest` | 2 |
| `/dynamic` | `AsterCollectionLoaders`, `AsterIconLoaders` | 2 |

The individual Camera entry evaluates its facade, Outline definition and three shared authoring
authorities. Its dictionary evaluates another facade and all four accepted Camera definitions;
it does not make treatment selection lazy. Fresh-process [isolation evidence](quality.md#evidence-coverage)
also checks the Filled, Dotted and Beaded individual entrypoints.

Amellus evaluates its facade, collection, three authoring authorities and 27 explicitly retained
members. Metadata discovery evaluates only `manifest/index.js` and `generated/manifest/index.js`;
loader-map discovery evaluates only `dynamic/index.js` and `generated/dynamic/index.js`. Neither
evaluates artwork until a definition is requested.

The same source snapshot emits:

- 101 JavaScript modules, totalling 110,065 unminified bytes;
- 101 declarations, totalling 31,291 bytes;
- 202 emitted files, totalling 141,356 bytes;
- ESM, `sideEffects: false` and Core as the only runtime dependency.

The package root and bare collection aggregate remain blocked. Snapshot counts and bytes are not
budgets; source, compiler or membership changes require fresh evidence rather than extrapolation.
[Packed conformance](quality.md#evidence-coverage) verifies the acquired payload, legal notices,
declarations and native execution. [Distribution costs](index.md#distribution-costs) owns the
separate acquisition, evaluation and bundle boundaries.

## Native scaling reference

Supplemental observations use canonical TypeScript sources, the actual synchroniser and compiler,
and public imports in consumer modules. Synthetic circles are measurement fixtures, not accepted
artwork. The matrix covers 1/10/100/1,000 definitions, 100 glyphs with three or ten treatments,
empty selections, shared/disjoint membership and 1,000 collections. The producer rejects an empty
icon source family; an empty collection remains valid.
This supplemental matrix is separate from the five-scenario command above.

Forty-five scenarios each retain seven fresh uninstrumented Node-process observations. The
first-import interval includes linking/evaluation of the consumer's imports; cached reimport of
that same consumer namespace is measured separately. Startup, request acquisition and export
verification also contribute to whole-worker time, not import-only time. There is no OS-cache
eviction or scheduler, antivirus or thermal isolation. Resource and evaluation probes run separately.

Representative static-import medians on the same Windows host are:

| Consumer | Required definitions/selections | First import |
| --- | --- | ---: |
| One individual subpath | One definition | 39.7 ms |
| Ten distinct individual subpaths | Ten definitions | 62.2 ms |
| 100 distinct individual subpaths | 100 definitions | 325.7 ms |
| 1,000 distinct individual subpaths | 1,000 definitions | 2,315 ms |
| 1,000 glyph dictionaries | One treatment each | 2,640 ms |
| 1,000 collections | 10,000 references to ten shared definitions | 5,241 ms |

Cached consumer reimport medians across the matrix are approximately 0.02 to 0.06 ms;
this reuses one namespace, not thousands of newly evaluated definitions. Separate calibrated
workloads invoke already-loaded loader functions rather than count cached imports as fresh work.

A three-treatment dictionary evaluates its three canonical leaves; a ten-treatment dictionary
evaluates ten. Mixed direct/dictionary/collection imports share definition references, but still
evaluate the entry modules they actually request. Metadata and loader discovery each evaluate two
Icons modules and no Core modules or artwork. Their parsing and initialisation costs still grow
with catalogue size.

## Dynamic Acquisition Reference

Generated loader functions import canonical modules directly. The
[dynamic guide](dynamic/index.md#deferred-evaluation) owns deferred evaluation and public object
identity; the public facades remain independent supported entrypoints.

Three rotated matched rounds with seven fresh-process samples each give these current medians
for importing the loader map and requesting all 1,000 concrete definitions:

| Catalogue shape | First acquisition | Evaluated Icons modules |
| --- | ---: | ---: |
| 1,000 glyphs, one treatment each | 2,265 ms | 1,004 |
| 100 glyphs, ten treatments each | 2,240 ms | 1,004 |

These include Node module/package resolution, filesystem acquisition and definition evaluation,
not rendering or search. Cached loader calls, map-only discovery and static imports are different
workloads; module counts do not establish a universal speed or bundler benefit.

Following loader acquisition with public leaf, dictionary and collection imports retains their
canonical references through the module cache. Separate resource observations for 1,000 loader
requests record approximately 92.0 MiB sampled peak RSS and 16.45 MiB post-GC heap with exports
retained. These whole-process values are not allocation counts or application memory budgets;
the [resource methodology](../../tooling/performance/index.md#processes-and-resources) owns limits.

## Acquisition reference

Acquisition is separate from evaluation. Local packed consumers contain the complete Icons
distribution and legal notices, but no authoring, test or tooling trees. Declaration checks and
native execution use only installed packages, including 1,000 distinct individual imports.

Seven fresh pnpm `10.28.1` processes per operation measure packing and offline frozen-lockfile
installation after an untimed seed primes an owned store. Installations recreate `node_modules`
at the same path using hoisted copy mode and include Core; the Core archive is prepared separately.
These are warm-store observations, not network download, default hard-link installation or
consumer startup timings. Archive byte counts refer to Icons alone. Repeated packs must have
identical archive hashes, and acquired distribution bytes must match the compiled payload.

| Catalogue | Icons archive | Installed Icons files | Pack median | Offline install median |
| --- | ---: | ---: | ---: | ---: |
| 1,000 definitions, 100 collections | 193,179 bytes | 6,432 | 4,599 ms | 7,731 ms |
| 1,000 definitions, 1,000 collections sharing ten definitions | 258,045 bytes | 8,232 | 4,070 ms | 7,515 ms |

Synthetic geometry and repeated metadata compress unusually well; these are not archive-size
predictions for future artwork. Installed consumers receive all files, regardless of how few they evaluate.

The optional full 10,000-definition package does not provide native-import or acquisition figures:
preparation exceeds its 120-second worker deadline. A separate 10,000-record metadata regression
verifies bounded compiler inference; it is not a complete-package performance result. Large
compiler probes also require the external memory safeguards described in the shared methodology.

## Interpretation

Exact evaluated module sets establish isolation; elapsed time is supporting evidence influenced
by startup, host state and instrumentation. No timing optimisation follows from module counts
alone, and native ESM observations do not guarantee bundler tree shaking.

Native primitives can clarify geometry without reducing the number of painted elements, output
size or rendering work. Use representative workloads instead of deriving a speed claim from node
or path counts. [SVG Quality Baseline](../svg/quality-baseline.md) owns renderer measurements;
[Core recognition](../core/definition/runtime/index.md#recognised-outputs) owns definition reuse.

[Catalogue Source Tooling](../../tooling/catalogue/index.md) owns build-time checking and repair.
Those operations do not run when an installed consumer imports or renders an icon. Changes to
private generation and changes to consumer evaluation must be measured separately.
