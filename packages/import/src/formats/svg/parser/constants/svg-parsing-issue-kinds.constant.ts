/**
 * @description Immutable parser-neutral issue families produced by the SVG ingestion boundary.
 */
export const svgParsingIssueKinds = Object.freeze({
  attributeLimit: "attribute-limit",
  doctype: "doctype",
  elementDepthLimit: "element-depth-limit",
  elementLimit: "element-limit",
  entityReference: "entity-reference",
  eventHandler: "event-handler",
  executableElement: "executable-element",
  foreignNamespace: "foreign-namespace",
  malformedDocument: "malformed-document",
  processingInstruction: "processing-instruction",
  pathDataLimit: "path-data-limit",
  rasterOrEmbeddedElement: "raster-or-embedded-element",
  resourceReference: "resource-reference",
  sourceLimit: "source-limit",
  textLimit: "text-limit",
  unsupportedCdata: "unsupported-cdata",
  unsupportedElement: "unsupported-element",
  unsupportedText: "unsupported-text",
  unsupportedTransform: "unsupported-transform",
} as const);
