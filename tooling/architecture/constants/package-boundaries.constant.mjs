/**
 * @description Immutable package identities, dependencies, exports, and private adapter authorities.
 */
export const packageBoundaries = Object.freeze({
  names: Object.freeze({
    build: "@aster/build",
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
  buildDependencies: Object.freeze(["@aster/core", "xmlsax-typescript"]),
  cliDependencies: Object.freeze(["@aster/core", "@aster/icons"]),
  svgDependencies: Object.freeze(["@aster/core"]),
  parser: Object.freeze({
    dependency: "xmlsax-typescript",
    version: "1.0.0",
    implementation: "src/parser/runtime/svg.parser.ts",
  }),
  buildPrivateFeatureRoots: Object.freeze([
    Object.freeze({
      path: "src/parser",
      issue: "@aster/build cannot expose its untrusted parser feature from the package root",
    }),
    Object.freeze({
      path: "src/validation",
      issue: "@aster/build cannot expose its internal validation feature from the package root",
    }),
    Object.freeze({
      path: "src/generator",
      issue: "@aster/build cannot expose its internal generator feature from the package root",
    }),
  ]),
});
