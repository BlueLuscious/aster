/**
 * @description Immutable report identity and scenario configuration for the CLI comparison.
 */
export const cliBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 2,
  /** @description Measured public package identity. */
  packageName: "@aster/cli",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/cli",
  /** @description Built standalone executable path. */
  executablePath: "packages/cli/dist/shell/aster.js",
  /** @description Stable synchronous scenario identities and sample sizes. */
  scenarios: Object.freeze({
    /** @description Core reconstruction attribution scenario. */
    coreRevalidation: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.reference.core-revalidation",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
    /** @description SVG rendering attribution scenario. */
    svgRender: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.reference.svg-render",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
    /** @description Minimal help argument parsing scenario. */
    parseHelp: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.shell.parse-help",
      /** @description Public operations executed per sample. */
      operationsPerSample: 2_000,
    }),
    /** @description Complete collection export argument parsing scenario. */
    parseCollectionExport: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.shell.parse-collection-export",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
    /** @description Structured JSON presentation scenario. */
    presentJson: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.shell.present-json",
      /** @description Public operations executed per sample. */
      operationsPerSample: 1_000,
    }),
  }),
  /** @description Stable asynchronous scenario identities and sample sizes. */
  asyncScenarios: Object.freeze({
    /** @description Programmatic help execution scenario. */
    help: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.command.help",
      /** @description Public operations executed per sample. */
      operationsPerSample: 500,
    }),
    /** @description Programmatic version execution scenario. */
    version: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.command.version",
      /** @description Public operations executed per sample. */
      operationsPerSample: 500,
    }),
    /** @description Prepared catalogue provider acquisition scenario. */
    providerLoad: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.catalogue.provider-load",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Complete icon discovery scenario. */
    listIcons: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.command.list-icons",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Single icon export planning scenario. */
    exportIcon: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.command.export-icon",
      /** @description Public operations executed per sample. */
      operationsPerSample: 100,
    }),
    /** @description Complete collection export planning scenario. */
    exportCollection: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.command.export-collection",
      /** @description Public operations executed per sample. */
      operationsPerSample: 20,
    }),
    /** @description Complete collection review planning scenario. */
    reviewCollection: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.command.review-collection",
      /** @description Public operations executed per sample. */
      operationsPerSample: 20,
    }),
  }),
  /** @description Stable cold-process scenario identities and expected output. */
  coldScenarios: Object.freeze({
    /** @description Plain Node process control scenario. */
    nodeControl: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.cold.node-control",
      /** @description Exact Node arguments used by the control process. */
      arguments: Object.freeze(["--input-type=module", "--eval", ""]),
      /** @description Exact standard output required from the control process. */
      stdout: "",
    }),
    /** @description Public CLI root import process scenario. */
    rootImport: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.cold.root-import",
      /** @description Exact Node arguments used to import the package root. */
      arguments: Object.freeze([
        "--input-type=module",
        "--eval",
        'await import("@aster/cli");',
      ]),
      /** @description Exact standard output required from root import. */
      stdout: "",
    }),
    /** @description Built executable version process scenario. */
    executableVersion: Object.freeze({
      /** @description Stable report scenario identity. */
      name: "cli.cold.executable-version",
      /** @description Exact executable arguments used by the scenario. */
      arguments: Object.freeze(["version"]),
      /** @description Exact standard output required from the executable. */
      stdout: "Aster 0.0.0\n",
    }),
  }),
});
