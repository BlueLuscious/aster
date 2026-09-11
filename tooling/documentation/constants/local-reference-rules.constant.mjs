/**
 * @description Immutable local-only reference rules forbidden from canonical documentation.
 */
export const localReferenceRules = Object.freeze([
  Object.freeze({
    /** @description Human-readable forbidden-reference family. */
    label: "a local planning path",
    /** @description Non-canonical repository path detection pattern. */
    pattern: /\bplans[\\/]/iu,
  }),
  Object.freeze({
    /** @description Human-readable forbidden-reference family. */
    label: "an epic identifier",
    /** @description Numbered work-group identifier detection pattern. */
    pattern: /\bepic\s+\d+\b/iu,
  }),
  Object.freeze({
    /** @description Human-readable forbidden-reference family. */
    label: "a phase identifier",
    /** @description Numbered work-stage identifier detection pattern. */
    pattern: /\bphase\s+\d+\b/iu,
  }),
  Object.freeze({
    /** @description Human-readable forbidden-reference family. */
    label: "an absolute Windows user path",
    /** @description Absolute Windows user path detection pattern. */
    pattern: /\b[A-Z]:\\Users\\/u,
  }),
  Object.freeze({
    /** @description Human-readable forbidden-reference family. */
    label: "an absolute macOS user path",
    /** @description Absolute macOS user path detection pattern. */
    pattern: /\/Users\/[^/\s]+/u,
  }),
]);
