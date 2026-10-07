import type { AsterPackageVersionSourceType } from "../types/aster-package-version-source.type.js";
import type { AsterPackageDependencyGroup } from "./aster-package-dependency-group.contract.js";

/**
 * @description Installed dependency groups selected by one explicit host-owned source.
 */
export interface AsterPackageDependencyEvidence {
  /** @description Source from which the root packages were selected. */
  readonly source: AsterPackageVersionSourceType;

  /** @description Independent root groups in canonical package order. */
  readonly groups: readonly AsterPackageDependencyGroup[];
}
