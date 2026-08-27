/**
 * @description Immutable report identity and scenario configuration for the CLI comparison.
 */
export const cliBaseline = Object.freeze({
  /** @description Serialisable report schema revision. */
  schemaVersion: 1,
  /** @description Measured public package identity. */
  packageName: "@aster/cli",
  /** @description Workspace-relative measured package root. */
  packagePath: "packages/cli",
  /** @description Built standalone executable path. */
  executablePath: "packages/cli/dist/shell/aster.js",
  /** @description Stable synchronous scenario identities and sample sizes. */
  scenarios: Object.freeze({
    coreRevalidation: Object.freeze({
      name: "cli.reference.core-revalidation",
      operationsPerSample: 1_000,
    }),
    svgRender: Object.freeze({
      name: "cli.reference.svg-render",
      operationsPerSample: 1_000,
    }),
    parseHelp: Object.freeze({
      name: "cli.shell.parse-help",
      operationsPerSample: 2_000,
    }),
    parseCollectionExport: Object.freeze({
      name: "cli.shell.parse-collection-export",
      operationsPerSample: 1_000,
    }),
    presentJson: Object.freeze({
      name: "cli.shell.present-json",
      operationsPerSample: 1_000,
    }),
  }),
  /** @description Stable asynchronous scenario identities and sample sizes. */
  asyncScenarios: Object.freeze({
    help: Object.freeze({
      name: "cli.command.help",
      operationsPerSample: 500,
    }),
    version: Object.freeze({
      name: "cli.command.version",
      operationsPerSample: 500,
    }),
    providerLoad: Object.freeze({
      name: "cli.catalogue.provider-load",
      operationsPerSample: 100,
    }),
    listIcons: Object.freeze({
      name: "cli.command.list-icons",
      operationsPerSample: 100,
    }),
    exportIcon: Object.freeze({
      name: "cli.command.export-icon",
      operationsPerSample: 100,
    }),
    exportCollection: Object.freeze({
      name: "cli.command.export-collection",
      operationsPerSample: 20,
    }),
  }),
  /** @description Stable cold-process scenario identities and expected output. */
  coldScenarios: Object.freeze({
    nodeControl: Object.freeze({
      name: "cli.cold.node-control",
      arguments: Object.freeze(["--input-type=module", "--eval", ""]),
      stdout: "",
    }),
    rootImport: Object.freeze({
      name: "cli.cold.root-import",
      arguments: Object.freeze([
        "--input-type=module",
        "--eval",
        'await import("@aster/cli");',
      ]),
      stdout: "",
    }),
    executableVersion: Object.freeze({
      name: "cli.cold.executable-version",
      arguments: Object.freeze(["version"]),
      stdout: "Aster 0.0.0\n",
    }),
  }),
});
