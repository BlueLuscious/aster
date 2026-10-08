# @luscious-garden/aster-icons

Canonical portable TypeScript icon and collection definitions for Aster.

The package depends only on `@luscious-garden/aster-core`. Every icon and collection has an isolated public
subpath; no package-wide definition root is exported. `@luscious-garden/aster-icons/manifest` provides
metadata-only discovery without loading complete definitions, while `@luscious-garden/aster-icons/dynamic`
resolves identities asynchronously without eager catalogue evaluation. These runtime boundaries
do not change npm acquisition: installing `@luscious-garden/aster-icons` acquires the complete published package.
The package contains no renderer, framework, DOM, filesystem, Import, or global catalogue
dependency.
The example below assumes `@luscious-garden/aster-svg` is installed independently by the consumer.

Install both packages for this example with
`pnpm add @luscious-garden/aster-icons@0.1.0 @luscious-garden/aster-svg@0.1.0`.
To use a definition without SVG rendering, install only `@luscious-garden/aster-icons`; it brings
its compatible Core dependency.

Canonical `*.icon.ts` and `*.collection.ts` modules are editable sources. Package builds
deterministically synchronise their manifests, exact loader maps and stable public facades before
compilation.

```ts
import { ArrowLeft } from "@luscious-garden/aster-icons/arrow-left";
import { Svg } from "@luscious-garden/aster-svg";

const markup = Svg.render(ArrowLeft);
```

Collections expose icons by typed local alias and provide an ordered list for iteration:

```ts
import { AmellusCollection } from "@luscious-garden/aster-icons/collections/amellus";

const cameraMarkup = Svg.render(AmellusCollection.icons.camera);
const collectionMarkup = AmellusCollection.members.map((icon) => Svg.render(icon));
```

Both views contain the same canonical icon objects. Importing Amellus evaluates all its declared
members even when only `.icons.camera` is read; import `@luscious-garden/aster-icons/camera` directly
when only that icon is needed.

The [release notes](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/releases/index.md)
describe migration from earlier candidates.

The package currently provides the accepted Amellus foundational collection. See the
[canonical package documentation](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/index.md),
[authoring workflow](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/workflow.md),
[release notes](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/releases/index.md) and
[Amellus collection authority](https://github.com/BlueLuscious/aster/blob/master/docs/en/collections/amellus/index.md).

## Licence

The software and documentation are licensed under [ISC](LICENSE). BlueLuscious-owned icon and
collection artwork marked with `LicenseRef-Aster-Artwork-1.0` follows the separate
[Aster Artwork Licence](ARTWORK-LICENCE.md), which permits commercial use in products but not
sale of the artwork as a standalone asset. Other artwork retains its declared terms. Software
and artwork may appear in the same `*.icon.ts` module.
