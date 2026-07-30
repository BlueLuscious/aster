import type {
  IconDefinition,
  IconRenderOptions,
} from "@aster/core";
import type { SvgMarkupType } from "../../render/types/index.js";

/**
 * @description Public immutable authority for rendering portable icon definitions as SVG markup.
 */
export interface SvgApi {
  /**
   * @description Renders one explicitly supplied portable definition as complete SVG markup.
   * @param definition - Portable icon definition to render.
   * @param options - Optional target-independent viewport, presentation, accessibility, and
   * direction options.
   * @returns Complete deterministic standalone SVG markup.
   */
  render(
    definition: IconDefinition,
    options?: IconRenderOptions,
  ): SvgMarkupType;
}
