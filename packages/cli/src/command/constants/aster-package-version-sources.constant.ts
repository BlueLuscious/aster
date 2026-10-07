/**
 * @description Closed provenance values for installed Aster package-version evidence.
 */
export const asterPackageVersionSources = Object.freeze({
  /** @description Packages directly installed for the current project. */
  project: "project",
  /** @description Packages resolved by the executed CLI installation. */
  cli: "cli",
} as const);
