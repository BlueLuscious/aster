import type { IconMetadata } from "../../metadata/contracts/index.js";
import type { IconNodeType } from "../../node/types/index.js";
import type { IconIdentity } from "./icon-identity.contract.js";
import type { IconViewBox } from "./icon-view-box.contract.js";

/**
 * @description Complete ordered, serialisable, render-neutral icon value.
 */
export interface IconDefinition {
  /**
   * @description Stable namespace, icon, and optional variant identity.
   */
  readonly identity: IconIdentity;

  /**
   * @description Logical coordinate system used by every geometry node.
   */
  readonly viewBox: IconViewBox;

  /**
   * @description Non-empty geometry sequence in deterministic paint order.
   */
  readonly nodes: readonly IconNodeType[];

  /**
   * @description Resolved metadata required by runtime and redistribution consumers.
   */
  readonly metadata: IconMetadata;
}
