import type { IPlannedFile } from "./planned-file.contract.js";
import type { IPlannedPackageExport } from "./planned-package-export.contract.js";

/**
 * @description Complete deterministic collection-package plan ready for a filesystem host.
 */
export interface IGenerationPlan {
  /**
   * @description Canonical collection slug represented by the plan.
   */
  readonly collection: string;

  /**
   * @description Intended generated collection package name.
   */
  readonly packageName: string;

  /**
   * @description Complete canonically ordered generated text files.
   */
  readonly files: readonly IPlannedFile[];

  /**
   * @description Complete canonically ordered public package subpaths.
   */
  readonly exports: readonly IPlannedPackageExport[];

  /**
   * @description Owned generated-root-relative files absent from the new plan.
   */
  readonly stalePaths: readonly string[];
}
