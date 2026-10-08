# @luscious-garden/aster-icons

Canonical portable Aster icons and collections, distributed through isolated public subpaths.
The package brings its compatible Core dependency; it does not render markup.

## Usage

```sh
pnpm add @luscious-garden/aster-icons
```

```ts
import { Camera } from "@luscious-garden/aster-icons/camera";

const definition = Camera;
```

Pass the definition to a renderer such as
[SVG](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/index.md).
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
