/**
 * @description Immutable package-manifest authority proving Aster generation ownership.
 */
export const generatedPackageAuthority = Object.freeze({
  coreDependency: "@aster/core",
  coreDependencyVersion: "workspace:*",
  editingPolicy: "generated",
  field: "aster",
  generatedBy: "@aster/build",
  rebuildCommand: "pnpm aster:build",
  schemaVersion: 1,
} as const);
