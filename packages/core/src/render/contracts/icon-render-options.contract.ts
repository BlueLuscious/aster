import type { IconPaintType } from "../../presentation/types/index.js";
import type { IconDirectionType } from "../types/index.js";

/**
 * @description Closed target-independent options supplied with an explicit icon definition.
 */
export interface IconRenderOptions {
  /**
   * @description Optional positive square viewport size in logical target units.
   */
  readonly size?: number;

  /**
   * @description Optional portable colour context used to resolve `currentColor`.
   */
  readonly colour?: IconPaintType;

  /**
   * @description Optional fill override subject to the icon presentation policy.
   */
  readonly fill?: IconPaintType;

  /**
   * @description Optional stroke override subject to the icon presentation policy.
   */
  readonly stroke?: IconPaintType;

  /**
   * @description Optional non-negative stroke-width override in viewBox units.
   */
  readonly strokeWidth?: number;

  /**
   * @description Optional non-empty authoritative accessible name.
   */
  readonly label?: string;

  /**
   * @description Optional non-empty target-native title and fallback accessible name.
   */
  readonly title?: string;

  /**
   * @description Optional explicit decorative or semantic accessibility intent.
   */
  readonly decorative?: boolean;

  /**
   * @description Optional explicit rendering direction, defaulting to left-to-right.
   */
  readonly direction?: IconDirectionType;
}
