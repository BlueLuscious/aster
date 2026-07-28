import type { IconIdentity } from "../../definition/contracts/icon-identity.contract.js";
import type { CollectionPresentationPolicy } from "../../presentation/contracts/index.js";
import type { IconRtlPolicyType } from "../types/index.js";

/**
 * @description Resolved metadata retained by one portable icon definition.
 * @remarks Search, source-review, and repository-only metadata remain outside runtime values.
 */
export interface IconMetadata {
  /**
   * @description Human-readable icon name for documentation and target inspection.
   */
  readonly displayName: string;

  /**
   * @description Policy controlling geometry in right-to-left rendering.
   */
  readonly rtl: IconRtlPolicyType;

  /**
   * @description Resolved collection presentation defaults and override authority.
   */
  readonly presentation: CollectionPresentationPolicy;

  /**
   * @description Effective artwork licence identifier when distribution requires one.
   */
  readonly licence?: string;

  /**
   * @description Effective attribution required by the artwork licence.
   */
  readonly attribution?: string;

  /**
   * @description Whether consumers should migrate away from this identity.
   */
  readonly deprecated: boolean;

  /**
   * @description Fully qualified replacement identity when one has been accepted.
   */
  readonly replacedBy?: IconIdentity;
}
