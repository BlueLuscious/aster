import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";

/**
 * @description Immutable standalone-shell tokens that adapt argv into structured commands.
 */
export const commandLineTokens = Object.freeze({
  commands: asterCommandNames,
  subjects: Object.freeze({
    catalogues: asterCommandSubjects.list.catalogues,
    collections: asterCommandSubjects.list.collections,
    icons: asterCommandSubjects.list.icons,
    icon: asterCommandSubjects.show.icon,
    collection: asterCommandSubjects.show.collection,
  }),
  options: Object.freeze({
    catalogue: "--catalogue",
    collection: "--collection",
    tag: "--tag",
    json: "--json",
    output: "--output",
    size: "--size",
    colour: "--colour",
    fill: "--fill",
    stroke: "--stroke",
    strokeWidth: "--stroke-width",
    direction: "--direction",
    label: "--label",
    title: "--title",
  }),
} as const);
