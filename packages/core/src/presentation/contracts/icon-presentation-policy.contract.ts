import type { IconPresentationOverrideType } from "../types/index.js";
import type { IconPresentation } from "./icon-presentation.contract.js";

/**
 * @description Resolved presentation defaults and caller override authority owned by an icon.
 */
export interface IconPresentationPolicy {
  /**
   * @description Portable presentation applied before node-specific values.
   */
  readonly defaults: IconPresentation;

  /**
   * @description Closed, duplicate-free sequence of capabilities callers may override.
   */
  readonly overrides: readonly IconPresentationOverrideType[];

  /**
   * @description Optional positive default square viewport size in logical units.
   */
  readonly defaultSize?: number;

  /**
   * @description Optional positive curator-approved minimum square viewport size.
   */
  readonly minimumSize?: number;
}
