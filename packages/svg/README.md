# @luscious-garden/aster-svg

Framework-independent ES2022 ESM rendering of portable Aster definitions into standalone SVG
strings. Rendering performs no DOM or filesystem effects.

## Usage

Install the renderer and icons used by this example:

```sh
pnpm add @luscious-garden/aster-svg @luscious-garden/aster-icons
```

```ts
import { ArrowLeft } from "@luscious-garden/aster-icons/arrow-left";
import { Svg } from "@luscious-garden/aster-svg";

const markup = Svg.render(ArrowLeft, { size: 24, label: "Back" });
```

Definitions authored with Core work through the same rendering API.
[Rendering](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/workflow.md)
owns options, accessibility, escaping and failure behaviour.

## Documentation

- [Package guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/index.md): exports, contracts and rendering features.
- [Version history](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/releases/index.md): changes and migration guidance.

## Licence

Software and documentation follow [ISC](LICENSE).
