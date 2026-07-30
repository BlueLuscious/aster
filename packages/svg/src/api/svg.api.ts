import type {
  IconDefinition,
  IconRenderOptions,
} from "@aster/core";
import { SvgRenderer } from "../render/runtime/svg.renderer.js";
import type { SvgMarkupType } from "../render/types/index.js";
import type { SvgApi } from "./contracts/index.js";

/**
 * @description Stateless internal renderer owned by the public SVG API boundary.
 */
const svgRenderer = new SvgRenderer();

/**
 * @description Immutable public object for rendering portable definitions as SVG markup.
 */
export const Svg: SvgApi = Object.freeze({
  /**
   * @description Renders one definition and optional portable options atomically.
   * @param definition - Portable icon definition to render.
   * @param options - Optional target-independent render options.
   * @returns Complete deterministic standalone SVG markup.
   */
  render(
    definition: IconDefinition,
    options?: IconRenderOptions,
  ): SvgMarkupType {
    return svgRenderer.render(definition, options);
  },
});
