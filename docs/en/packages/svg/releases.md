# SVG Release Notes

## 0.1.0 candidate

Status: **Not published**. This is the proposed first public version, not a previously supported
release. No consumer migration is required.

**Compatible capability:** `@aster/svg` exposes `Svg.render()`, `SvgRenderError`, and their
public contracts and types through the ES2022 ESM root. Rendering an explicit Core definition
produces deterministic standalone SVG markup. Its runtime dependency is `@aster/core@^0.1.0`.

**Accepted limits:** The renderer returns markup rather than DOM nodes, framework components or
files. It neither discovers icons nor imports external SVG. Only the root package export is
public; no CommonJS or legacy build is supplied. See [SVG](index.md), [Workflow](workflow.md),
and [Quality](quality.md) for rendering semantics and evidence.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
