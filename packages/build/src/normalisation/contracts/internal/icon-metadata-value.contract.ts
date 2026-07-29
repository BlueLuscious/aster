import type { IconIdentity, IconRtlPolicyType } from "@aster/core";

/**
 * @description Structured icon-authored metadata accepted from a replaceable metadata decoder.
 */
export interface IIconMetadataValue {
  /**
   * @description Canonical metadata source identifier that produced this value.
   */
  readonly sourceId: string;

  /**
   * @description Complete logical identity owned by the metadata.
   */
  readonly identity: IconIdentity;

  /**
   * @description Human-readable icon name retained by the portable definition.
   */
  readonly displayName: string;

  /**
   * @description Optional explicit right-to-left policy, defaulting to preserve.
   */
  readonly rtl?: IconRtlPolicyType;

  /**
   * @description Optional icon-specific artwork licence.
   */
  readonly licence?: string;

  /**
   * @description Optional icon-specific artwork attribution.
   */
  readonly attribution?: string;

  /**
   * @description Optional deprecation state, defaulting to false.
   */
  readonly deprecated?: boolean;

  /**
   * @description Optional fully qualified replacement identity.
   */
  readonly replacedBy?: IconIdentity;
}
