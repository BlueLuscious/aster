/**
 * @description Immutable package identities, dependencies, exports, and private adapter authorities.
 */
export const packageBoundaries = Object.freeze({
  names: Object.freeze({
    import: "@aster/import",
    cli: "@aster/cli",
    core: "@aster/core",
    icons: "@aster/icons",
    svg: "@aster/svg",
  }),
  runtimeDependencyFields: Object.freeze([
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]),
  rootExport: Object.freeze({
    key: ".",
    import: "./dist/index.js",
    types: "./dist/index.d.ts",
  }),
  workspaceProtocolPrefix: "workspace:",
  importDependencies: Object.freeze(["@aster/core", "xmlsax-typescript"]),
  cliDependencies: Object.freeze(["@aster/core", "@aster/icons", "@aster/svg"]),
  svgDependencies: Object.freeze(["@aster/core"]),
  parser: Object.freeze({
    dependency: "xmlsax-typescript",
    version: "1.0.0",
    implementation: "src/formats/svg/parser/runtime/svg.parser.ts",
  }),
  importPrivateFeatureRoots: Object.freeze([
    Object.freeze({
      path: "src/formats/svg/parser",
      issue: "@aster/import cannot expose its untrusted parser feature from the package root",
    }),
    Object.freeze({
      path: "src/formats/svg/validation",
      issue: "@aster/import cannot expose its internal validation feature from the package root",
    }),
  ]),
});
