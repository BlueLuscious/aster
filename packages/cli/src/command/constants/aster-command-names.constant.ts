/**
 * @description Immutable identities of the accepted initial Aster command family.
 */
export const asterCommandNames = Object.freeze({
  export: "export",
  list: "list",
  search: "search",
  show: "show",
  help: "help",
  version: "version",
} as const);
