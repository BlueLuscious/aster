/**
 * @description Immutable authored and forbidden collection directory authorities.
 */
export const collectionBoundaries = Object.freeze({
  required: Object.freeze(["masters", "metadata", "svg"]),
  forbidden: Object.freeze([
    "contact-sheets",
    "dist",
    "generated",
    "normalised",
    "previews",
    "search-indexes",
  ]),
  slugPattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/u,
});
