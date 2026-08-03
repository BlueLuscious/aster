/**
 * @description Immutable standalone-shell tokens that adapt argv into structured commands.
 */
export const commandLineTokens = Object.freeze({
  commands: Object.freeze({
    list: "list",
    search: "search",
    show: "show",
    help: "help",
    version: "version",
  }),
  subjects: Object.freeze({
    catalogues: "catalogues",
    collections: "collections",
    icons: "icons",
    icon: "icon",
    collection: "collection",
  }),
  options: Object.freeze({
    catalogue: "--catalogue",
    collection: "--collection",
    tag: "--tag",
    json: "--json",
  }),
} as const);
