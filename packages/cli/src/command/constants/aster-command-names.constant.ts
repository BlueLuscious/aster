/**
 * @description Immutable identities of the accepted initial Aster command family.
 */
export const asterCommandNames = Object.freeze({
  /** @description Command that creates portable artefacts from catalogue definitions. */
  export: "export",
  /** @description Command that enumerates catalogue value families. */
  list: "list",
  /** @description Command that publishes visual and technical definition evidence. */
  review: "review",
  /** @description Command that searches catalogue records. */
  search: "search",
  /** @description Command that resolves one exact catalogue record. */
  show: "show",
  /** @description Command that exposes the accepted command grammar. */
  help: "help",
  /** @description Command that reports installed product metadata. */
  version: "version",
} as const);
