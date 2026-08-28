/**
 * @description Immutable safety classification for rejected SVG element names.
 */
export const svgSafetyElements = Object.freeze({
  executable: Object.freeze([
    "a",
    "script",
    "set",
    "style",
    "animate",
    "animateMotion",
    "animateTransform",
  ]),
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
