import type {
  IconIdentity,
  IconRtlPolicyType,
} from "@aster/core";

/**
 * @description Internal structural view of one built-in Icons manifest entry.
 */
export type TAsterIconManifestEntry = Readonly<{
  /** @description Canonical textual icon key. */
  key: string;
  /** @description Complete portable icon identity. */
  identity: IconIdentity;
  /** @description Human-readable icon name. */
  displayName: string;
  /** @description Optional intrinsic discovery tags. */
  tags?: readonly string[];
  /** @description Right-to-left geometry policy. */
  rtl: IconRtlPolicyType;
  /** @description Optional effective artwork licence. */
  licence?: string;
  /** @description Optional effective artwork attribution. */
  attribution?: string;
  /** @description Whether consumers should migrate from this identity. */
  deprecated: boolean;
  /** @description Optional complete replacement identity. */
  replacedBy?: IconIdentity;
}>;
