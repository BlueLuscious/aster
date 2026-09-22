import type {
  IconIdentity,
  IconRtlPolicyType,
} from "@luscious-garden/aster-core";

/**
 * @description Lightweight portable metadata accepted for icon discovery.
 * @remarks Presentation policy belongs to complete definitions and is deliberately absent from
 * catalogue discovery.
 */
export interface CatalogueIconMetadata {
  /** @description Human-readable icon name. */
  readonly displayName: string;

  /** @description Optional canonical intrinsic discovery terms. */
  readonly tags?: readonly string[];

  /** @description Policy controlling geometry in right-to-left rendering. */
  readonly rtl: IconRtlPolicyType;

  /** @description Optional effective artwork licence identifier. */
  readonly licence?: string;

  /** @description Optional effective attribution required by the artwork licence. */
  readonly attribution?: string;

  /** @description Whether consumers should migrate away from this identity. */
  readonly deprecated: boolean;

  /** @description Optional complete replacement identity. */
  readonly replacedBy?: IconIdentity;
}
