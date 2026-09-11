/**
 * @description Immutable repository paths interpreted by architecture policy.
 */
export const repositoryArchitecturePaths = Object.freeze({
  /** @description Import SVG normalisation feature root. */
  importSvgNormalisation: "src/formats/svg/normalisation",
  /** @description Import SVG validation runtime root. */
  importSvgValidationRuntime: "src/formats/svg/validation/runtime",
  /** @description CLI shell feature root. */
  cliShell: "src/shell",
  /** @description CLI shell output feature root. */
  cliShellOutput: "src/shell/output",
  /** @description CLI shell output runtime root. */
  cliShellOutputRuntime: "src/shell/output/runtime",
  /** @description CLI shell parsing feature root. */
  cliShellParsing: "src/shell/parsing",
  /** @description CLI shell presentation feature root. */
  cliShellPresentation: "src/shell/presentation",
  /** @description Package TypeScript configuration path. */
  packageConfiguration: "tsconfig.json",
  /** @description Package public source entry path. */
  packageEntry: "src/index.ts",
  /** @description Package manifest path. */
  packageManifest: "package.json",
  /** @description Workspace package directory. */
  packages: "packages",
  /** @description pnpm workspace declaration path. */
  pnpmWorkspace: "pnpm-workspace.yaml",
  /** @description Package source directory. */
  source: "src",
  /** @description Private repository tooling directory. */
  tooling: "tooling",
  /** @description Shared workspace TypeScript configuration path. */
  workspaceConfiguration: "tsconfig.base.json",
  /** @description Workspace root manifest path. */
  workspaceManifest: "package.json",
});
