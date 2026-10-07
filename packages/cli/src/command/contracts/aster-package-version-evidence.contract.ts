import type { AsterPackageVersionSourceType } from "../types/aster-package-version-source.type.js";
import type { AsterInstalledPackageVersion } from "./aster-installed-package-version.contract.js";

/**
 * @description Explicit installed package versions bound to one host-owned resolution source.
 */
export interface AsterPackageVersionEvidence {
  /** @description Project or executed-CLI installation that supplied the versions. */
  readonly source: AsterPackageVersionSourceType;

  /** @description Accepted installed package records from that source only. */
  readonly packages: readonly AsterInstalledPackageVersion[];
}
