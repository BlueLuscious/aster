import { asterCommandNames } from "../../../command/constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../../../command/constants/aster-command-subjects.constant.js";

/**
 * @description Immutable standalone-shell tokens that adapt argv into structured commands.
 */
export const commandLineTokens = Object.freeze({
  /** @description Canonical command tokens shared with the headless command layer. */
  commands: asterCommandNames,
  /** @description Standalone tokens selecting command-owned value families. */
  subjects: Object.freeze({
    /** @description Token selecting catalogue providers. */
    catalogues: asterCommandSubjects.list.catalogues,
    /** @description Token selecting collection records. */
    collections: asterCommandSubjects.list.collections,
    /** @description Token selecting icon records. */
    icons: asterCommandSubjects.list.icons,
    /** @description Token selecting one exact icon. */
    icon: asterCommandSubjects.show.icon,
    /** @description Token selecting one exact collection. */
    collection: asterCommandSubjects.show.collection,
  }),
  /** @description Closed standalone option-token vocabulary. */
  options: Object.freeze({
    /** @description Option selecting one catalogue provider. */
    catalogue: "--catalogue",
    /** @description Option filtering by collection membership. */
    collection: "--collection",
    /** @description Repeatable option filtering by tag. */
    tag: "--tag",
    /** @description Option selecting machine-readable presentation. */
    json: "--json",
    /** @description Option selecting a publication root. */
    output: "--output",
    /** @description Option allowing replacement of an owned review document. */
    replace: "--replace",
    /** @description Option selecting rendered icon size. */
    size: "--size",
    /** @description Option selecting the inherited icon colour. */
    colour: "--colour",
    /** @description Option overriding icon fill paint. */
    fill: "--fill",
    /** @description Option overriding icon stroke paint. */
    stroke: "--stroke",
    /** @description Option overriding icon stroke width. */
    strokeWidth: "--stroke-width",
    /** @description Option selecting left-to-right or right-to-left rendering. */
    direction: "--direction",
    /** @description Option supplying an accessible icon label. */
    label: "--label",
    /** @description Option supplying an SVG title. */
    title: "--title",
  }),
} as const);
