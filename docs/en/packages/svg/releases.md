# SVG Release Notes

## Unreleased

No SVG package change has been accepted since `0.1.0-rc.2`.

## 0.1.0-rc.2

Status: **Published on 6 October 2026** under the npm `next` tag.

Registry: [`@luscious-garden/aster-svg@0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-svg/v/0.1.0-rc.2)

Approved archive SHA-256: `bec106a2ef85bb8d4d17d896aeebb0145aef575b09d7f6c5d2f8919b17d1b7ff`.

**Breaking output change:** `Svg.render(...)` now includes the fixed
`data-rendered-by="Aster"` attribute on every successful root `<svg>`. The public call signature,
geometry and accessibility policy are unchanged, but exact SVG bytes differ from the published
`0.1.0-rc.1`. Consumers comparing markup byte-for-byte must update their fixtures. The published
package depends on Core `^0.1.0-rc.2`; CLI `0.1.0-rc.2` consumes this renderer.

## 0.1.0-rc.1

Status: **Published on 22 September 2026**. This is the formal release candidate for the first
public `0.1.0`, not a previously supported release. No consumer migration is required.

Registry: [`@luscious-garden/aster-svg@0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-svg/v/0.1.0-rc.1)

Approved archive SHA-256: `C2FCD1EA1C64052486710F13AB49662184DDF61B7AE820B935BC948F1B140831`.

**Compatible capability:** `@luscious-garden/aster-svg` exposes `Svg.render()`, `SvgRenderError`, and their
public contracts and types through the ES2022 ESM root. Rendering an explicit Core definition
produces deterministic standalone SVG markup. Its runtime dependency is `@luscious-garden/aster-core@^0.1.0-rc.1`.

**Accepted limits:** The renderer returns markup rather than DOM nodes, framework components or
files. It neither discovers icons nor imports external SVG. Only the root package export is
public; no CommonJS or legacy build is supplied. See [SVG](index.md), [Workflow](workflow.md),
and [Quality](quality.md) for rendering semantics and evidence.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
