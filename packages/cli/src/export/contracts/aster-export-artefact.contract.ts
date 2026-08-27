import type { SvgMarkupType } from "@aster/svg";
import type { svgExportArtefactSchema } from "../constants/svg-export-artefact-schema.constant.js";

/**
 * @description One complete immutable target artefact in a headless export plan.
 */
export interface AsterExportArtefact {
  /**
   * @description Canonical forward-slash relative path derived from portable icon identity.
   */
  readonly path: string;

  /**
   * @description Exact media type associated with the complete artefact content.
   */
  readonly mediaType: typeof svgExportArtefactSchema.mediaType;

  /**
   * @description Complete deterministic standalone SVG markup.
   */
  readonly content: SvgMarkupType;
}

