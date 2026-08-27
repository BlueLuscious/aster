import type { IconIdentity } from "@aster/core";
import { svgExportArtefactSchema } from "../constants/svg-export-artefact-schema.constant.js";

/**
 * @description Derives canonical logical artefact paths from portable icon identity only.
 */
export class ExportPathFormatter {
  /**
   * @description Formats one icon identity as a forward-slash relative SVG path.
   * @param identity - Accepted portable icon identity.
   * @returns Canonical namespace, name, variant, and extension path.
   */
  icon(identity: IconIdentity): string {
    const namespace = identity.namespace === undefined
      ? ""
      : `${identity.namespace}/`;
    const variant = identity.variant === undefined
      ? ""
      : `@${identity.variant}`;
    return `${namespace}${identity.name}${variant}${svgExportArtefactSchema.extension}`;
  }
}

