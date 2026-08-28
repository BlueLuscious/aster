/**
 * @description Immutable repository paths interpreted by architecture policy.
 */
export const repositoryArchitecturePaths = Object.freeze({
  importSvgNormalisation: "src/formats/svg/normalisation",
  importSvgValidationRuntime: "src/formats/svg/validation/runtime",
  cliShell: "src/shell",
  cliShellOutput: "src/shell/output",
  cliShellOutputRuntime: "src/shell/output/runtime",
  cliShellParsing: "src/shell/parsing",
  cliShellPresentation: "src/shell/presentation",
  packageConfiguration: "tsconfig.json",
  packageEntry: "src/index.ts",
  packageManifest: "package.json",
  packages: "packages",
  pnpmWorkspace: "pnpm-workspace.yaml",
  source: "src",
  tooling: "tooling",
  workspaceConfiguration: "tsconfig.base.json",
  workspaceManifest: "package.json",
});
