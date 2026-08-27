/**
 * @description Immutable subjects accepted by commands that address catalogue value families.
 */
export const asterCommandSubjects = Object.freeze({
  export: Object.freeze({
    icon: "icon",
    collection: "collection",
  } as const),
  list: Object.freeze({
    catalogues: "catalogues",
    collections: "collections",
    icons: "icons",
  } as const),
  show: Object.freeze({
    icon: "icon",
    collection: "collection",
  } as const),
});
