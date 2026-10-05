/**
 * @description Ordered public package identities resolved from one installed Aster CLI.
 */
export const installedAsterPackages = Object.freeze([
  Object.freeze({
    /** @description Selector for the portable definition package. */
    selector: "core",
    /** @description Published package identity for portable definitions. */
    name: "@luscious-garden/aster-core",
  }),
  Object.freeze({
    /** @description Selector for the authored icon catalogue. */
    selector: "icons",
    /** @description Published package identity for icon definitions. */
    name: "@luscious-garden/aster-icons",
  }),
  Object.freeze({
    /** @description Selector for the SVG renderer. */
    selector: "svg",
    /** @description Published package identity for SVG rendering. */
    name: "@luscious-garden/aster-svg",
  }),
  Object.freeze({
    /** @description Selector for the standalone command host. */
    selector: "cli",
    /** @description Published package identity for the CLI executable. */
    name: "@luscious-garden/aster-cli",
  }),
] as const);
