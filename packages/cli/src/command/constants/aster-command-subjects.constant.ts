/**
 * @description Immutable subjects accepted by commands that address catalogue value families.
 */
export const asterCommandSubjects = Object.freeze({
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
