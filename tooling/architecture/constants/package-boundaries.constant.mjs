/**
 * @description Immutable package identities, dependencies, exports, and private adapter authorities.
 */
export const packageBoundaries = Object.freeze({
  /** @description Canonical workspace package identities. */
  names: Object.freeze({
    /** @description Import package identity. */
    import: "@luscious-garden/aster-import",
    /** @description CLI package identity. */
    cli: "@luscious-garden/aster-cli",
    /** @description Core package identity. */
    core: "@luscious-garden/aster-core",
    /** @description Icons package identity. */
    icons: "@luscious-garden/aster-icons",
    /** @description SVG package identity. */
    svg: "@luscious-garden/aster-svg",
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
  importDependencies: Object.freeze(["@luscious-garden/aster-core", "xmlsax-typescript"]),
  /** @description Accepted CLI production dependencies. */
  cliDependencies: Object.freeze(["@luscious-garden/aster-core", "@luscious-garden/aster-icons", "@luscious-garden/aster-svg"]),
  /** @description Accepted Icons production dependencies. */
  iconsDependencies: Object.freeze(["@luscious-garden/aster-core"]),
  /** @description Exact scalable Icons package export surface. */
  iconsExports: Object.freeze({
    /** @description Deliberately unavailable package root. */
    ".": null,
    /** @description Deliberately unavailable aggregate collection root. */
    "./collections": null,
    /** @description Metadata-only catalogue manifest entry. */
    "./manifest": Object.freeze({
      types: "./dist/manifest/index.d.ts",
      import: "./dist/manifest/index.js",
    }),
    /** @description Asynchronous definition loader entry. */
    "./dynamic": Object.freeze({
      types: "./dist/dynamic/index.d.ts",
      import: "./dist/dynamic/index.js",
    }),
    /** @description Generated per-collection facade family. */
    "./collections/*": Object.freeze({
      types: "./dist/generated/facades/collections/*.d.ts",
      import: "./dist/generated/facades/collections/*.js",
    }),
    /** @description Generated per-icon facade family. */
    "./*": Object.freeze({
      types: "./dist/generated/facades/icons/*.d.ts",
      import: "./dist/generated/facades/icons/*.js",
    }),
  }),
  /** @description Accepted SVG production dependencies. */
  svgDependencies: Object.freeze(["@luscious-garden/aster-core"]),
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
      issue: "@luscious-garden/aster-import cannot expose its untrusted parser feature from the package root",
    }),
    Object.freeze({
      /** @description Private validation feature root. */
      path: "src/formats/svg/validation",
      /** @description Diagnostic emitted when the validation feature becomes public. */
      issue: "@luscious-garden/aster-import cannot expose its internal validation feature from the package root",
    }),
  ]),
});
