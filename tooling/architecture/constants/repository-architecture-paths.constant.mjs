/**
 * @description Immutable repository paths interpreted by architecture policy.
 */
export const repositoryArchitecturePaths = Object.freeze({
  buildNormalisation: "src/normalisation",
  buildValidationRuntime: "src/validation/runtime",
  cliShell: "src/shell",
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
