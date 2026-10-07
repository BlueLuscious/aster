import type { AsterInstalledPackageVersion } from "./aster-installed-package-version.contract.js";

/**
 * @description One installed package and its own direct Aster runtime dependencies.
 */
export interface AsterPackageDependencyGroup {
  /** @description Installed package whose dependencies were inspected. */
  readonly root: AsterInstalledPackageVersion;

  /** @description Direct installed Aster dependencies in canonical package order. */
  readonly dependencies: readonly AsterInstalledPackageVersion[];
}
