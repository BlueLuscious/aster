/**
 * @description Immutable local-only reference rules forbidden from canonical documentation.
 */
export const localReferenceRules = Object.freeze([
  Object.freeze({ label: "a local planning path", pattern: /\bplans[\\/]/iu }),
  Object.freeze({ label: "an epic identifier", pattern: /\bepic\s+\d+\b/iu }),
  Object.freeze({ label: "a phase identifier", pattern: /\bphase\s+\d+\b/iu }),
  Object.freeze({ label: "an absolute Windows user path", pattern: /\b[A-Z]:\\Users\\/u }),
  Object.freeze({ label: "an absolute macOS user path", pattern: /\/Users\/[^/\s]+/u }),
]);
