/**
 * @description Immutable safety classification for rejected SVG element names.
 */
export const svgSafetyElements = Object.freeze({
  /** @description Rejected SVG element names classified as executable. */
  executable: Object.freeze([
    "a",
    "script",
    "set",
    "style",
    "animate",
    "animateMotion",
    "animateTransform",
  ]),
  /** @description Rejected SVG element names classified as embedded. */
  embedded: Object.freeze([
    "audio",
    "canvas",
    "embed",
    "feImage",
    "foreignObject",
    "iframe",
    "image",
    "link",
    "object",
    "use",
    "video",
  ]),
});
