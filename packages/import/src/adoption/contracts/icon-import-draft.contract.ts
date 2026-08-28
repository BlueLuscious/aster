import type {
  IconIdentity,
  IconNodeType,
  IconViewBox,
} from "@aster/core";
import type { IconImportMetrics } from "./icon-import-metrics.contract.js";
import type { IconImportProvenance } from "./icon-import-provenance.contract.js";

/**
 * @description Immutable metadata-free portable geometry produced by source inspection.
 */
export interface IconImportDraft {
  /**
   * @description Portable identity assigned independently from source content.
   */
  readonly identity: IconIdentity;

  /**
   * @description Validated portable coordinate system.
   */
  readonly viewBox: IconViewBox;

  /**
   * @description Accepted geometry in deterministic paint order.
   */
  readonly nodes: readonly IconNodeType[];

  /**
   * @description Technical review facts independent from collection policy.
   */
  readonly metrics: IconImportMetrics;

  /**
   * @description Acquired source responsible for this draft.
   */
  readonly provenance: IconImportProvenance;
}
