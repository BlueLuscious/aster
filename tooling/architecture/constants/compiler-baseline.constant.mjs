/**
 * @description Immutable host-independent compiler options required by repository architecture.
 */
export const compilerBaseline = Object.freeze({
  target: "ES2022",
  module: "ESNext",
  moduleResolution: "Bundler",
  types: Object.freeze([]),
  lib: Object.freeze(["ES2022"]),
});
