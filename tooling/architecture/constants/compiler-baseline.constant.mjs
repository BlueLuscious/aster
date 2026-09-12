/**
 * @description Immutable host-independent compiler options required by repository architecture.
 */
export const compilerBaseline = Object.freeze({
  /** @description Required JavaScript language target. */
  target: "ES2022",
  /** @description Required emitted module family. */
  module: "ESNext",
  /** @description Required TypeScript module resolution strategy. */
  moduleResolution: "Bundler",
  /** @description Accepted ambient type-library names. */
  types: Object.freeze([]),
  /** @description Accepted runtime library declarations. */
  lib: Object.freeze(["ES2022"]),
});
