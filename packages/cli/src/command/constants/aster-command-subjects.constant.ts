/**
 * @description Immutable subjects accepted by commands that address catalogue value families.
 */
export const asterCommandSubjects = Object.freeze({
  /** @description Subjects accepted by export planning. */
  export: Object.freeze({
    /** @description Exact icon selected for export. */
    icon: "icon",
    /** @description Exact collection selected for export. */
    collection: "collection",
  } as const),
  /** @description Value families accepted by catalogue listing. */
  list: Object.freeze({
    /** @description Available catalogue provider family. */
    catalogues: "catalogues",
    /** @description Available collection-record family. */
    collections: "collections",
    /** @description Available icon-record family. */
    icons: "icons",
  } as const),
  /** @description Exact value families accepted by catalogue lookup. */
  show: Object.freeze({
    /** @description Exact icon selected for lookup. */
    icon: "icon",
    /** @description Exact collection selected for lookup. */
    collection: "collection",
  } as const),
});
