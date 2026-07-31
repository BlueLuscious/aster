import type { IconPresentationPolicy } from "@aster/core";

/**
 * @description Accepted version-one collection metadata required by downstream build stages.
 */
export interface IDecodedCollectionMetadata {
  /**
   * @description Canonical metadata source identifier.
   */
  readonly sourceId: string;

  /**
   * @description Canonical collection slug.
   */
  readonly collection: string;

  /**
   * @description Canonical generated npm package name.
   */
  readonly packageName: string;

  /**
   * @description Canonical generated package semantic version.
   */
  readonly packageVersion: string;

  /**
   * @description Human-readable generated package description.
   */
  readonly description: string;

  /**
   * @description Default effective artwork and package licence expression.
   */
  readonly licence: string;

  /**
   * @description Default artwork attribution.
   */
  readonly attribution: string;

  /**
   * @description Whether icon metadata may replace collection licence authority.
   */
  readonly allowIconLicenceOverride: boolean;

  /**
   * @description Resolved portable collection presentation policy.
   */
  readonly presentation: IconPresentationPolicy;

  /**
   * @description Raw version-one visual validation configuration.
   */
  readonly validation: Readonly<Record<string, unknown>>;
}
