/**
 * @description Immutable package identities, dependencies, exports, and private adapter authorities.
 */
export const packageBoundaries = Object.freeze({
  /** @description Canonical workspace package identities. */
  names: Object.freeze({
    /** @description Import package identity. */
    import: "@aster/import",
    /** @description CLI package identity. */
    cli: "@aster/cli",
    /** @description Core package identity. */
    core: "@aster/core",
    /** @description Icons package identity. */
    icons: "@aster/icons",
    /** @description SVG package identity. */
    svg: "@aster/svg",
  }),
  /** @description Manifest fields that grant production runtime dependencies. */
  runtimeDependencyFields: Object.freeze([
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]),
  /** @description Required package root export declaration. */
  rootExport: Object.freeze({
    /** @description Canonical root export key. */
    key: ".",
    /** @description Canonical root JavaScript entry. */
    import: "./dist/index.js",
    /** @description Canonical root declaration entry. */
    types: "./dist/index.d.ts",
  }),
  /** @description Required protocol prefix for workspace dependencies. */
  workspaceProtocolPrefix: "workspace:",
  /** @description Accepted Import production dependencies. */
  importDependencies: Object.freeze(["@aster/core", "xmlsax-typescript"]),
  /** @description Accepted CLI production dependencies. */
  cliDependencies: Object.freeze(["@aster/core", "@aster/icons", "@aster/svg"]),
  /** @description Accepted SVG production dependencies. */
  svgDependencies: Object.freeze(["@aster/core"]),
  /** @description Accepted XML parser dependency and private adapter boundary. */
  parser: Object.freeze({
    /** @description Accepted XML parser package identity. */
    dependency: "xmlsax-typescript",
    /** @description Exactly accepted XML parser version. */
    version: "1.0.0",
    /** @description Sole source module allowed to import the XML parser. */
    implementation: "src/formats/svg/parser/runtime/svg.parser.ts",
  }),
  /** @description Import feature roots forbidden from the package public entry. */
  importPrivateFeatureRoots: Object.freeze([
    Object.freeze({
      /** @description Private parser feature root. */
      path: "src/formats/svg/parser",
      /** @description Diagnostic emitted when the parser feature becomes public. */
      issue: "@aster/import cannot expose its untrusted parser feature from the package root",
    }),
    Object.freeze({
      /** @description Private validation feature root. */
      path: "src/formats/svg/validation",
      /** @description Diagnostic emitted when the validation feature becomes public. */
      issue: "@aster/import cannot expose its internal validation feature from the package root",
    }),
  ]),
});
