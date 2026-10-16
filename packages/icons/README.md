# @luscious-garden/aster-icons

Canonical portable Aster icons and collections, distributed through isolated public subpaths.
The package brings its compatible Core dependency; it does not render markup.

## Usage

Examples follow the [current source contract](https://github.com/BlueLuscious/aster/blob/master/docs/en/index.md#source-and-published-versions).

```sh
pnpm add @luscious-garden/aster-icons
```

### Individual icons

```ts
import { CameraOutline } from "@luscious-garden/aster-icons/camera/outline";

const definition = CameraOutline;
```

Pass the definition to a renderer such as
[SVG](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/index.md).

### Glyph variants

```ts
import { CameraVariants } from "@luscious-garden/aster-icons/camera";

const cameraOutline = CameraVariants.outline;
```

This frozen dictionary loads all distributed treatments of Camera, currently only Outline.
It has no default and is not itself renderable. Use the individual subpath to load just one
treatment. See the
[Glyphs guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/glyphs/index.md)
for exact keys and the explicit-treatment migration.

### Collections

Select a treatment by collection alias, or iterate concrete definitions in their declared order:

```ts
import { Amellus } from "@luscious-garden/aster-icons/collections/amellus";

const camera = Amellus.icons.camera.outline;
const orderedIcons = Amellus.members;
```

See the
[Collections guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/collections/index.md)
for the contract and export-naming migration.

Use an individual subpath when only one icon is needed; a collection import evaluates all its
declared members. Installation acquires the complete package, independently of runtime imports.

## Documentation

- [Package guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/index.md): definitions, collections, metadata discovery and dynamic loaders.
- [Authoring](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/workflow.md): editable sources and generated distribution.
- [Amellus](https://github.com/BlueLuscious/aster/blob/master/docs/en/collections/amellus/index.md): collection identity and visual rules.
- [Version history](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/icons/releases/index.md): changes and migrations.

## Licence

Software and documentation follow [ISC](LICENSE). Marked BlueLuscious-owned artwork follows the
separate [Aster Artwork Licence](ARTWORK-LICENCE.md); other artwork retains its declared terms.
