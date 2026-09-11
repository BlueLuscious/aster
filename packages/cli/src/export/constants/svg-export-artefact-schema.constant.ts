/**
 * @description Immutable SVG artefact representation owned by the export feature.
 */
export const svgExportArtefactSchema = Object.freeze({
  /** @description File extension assigned to generated SVG artefacts. */
  extension: ".svg",
  /** @description Internet media type assigned to generated SVG artefacts. */
  mediaType: "image/svg+xml",
} as const);
