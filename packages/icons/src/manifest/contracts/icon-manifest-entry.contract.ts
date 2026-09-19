import type {
  IconIdentity,
  IconRtlPolicyType,
} from "@aster/core";

/**
 * @description Lightweight searchable metadata for one distributed icon definition.
 * @remarks The entry deliberately excludes geometry, presentation policy and the complete
 * definition so discovery does not evaluate or retain artwork modules.
 */
export interface IconManifestEntry {
  /** @description Canonical textual identity used by discovery and dynamic loading. */
  readonly key: string;

  /** @description Complete portable icon identity. */
  readonly identity: IconIdentity;

  /** @description Named export exposed by the icon's public definition subpath. */
  readonly symbol: string;

  /** @description Human-readable icon name. */
  readonly displayName: string;

  /** @description Optional canonical intrinsic terms for search and discovery. */
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
