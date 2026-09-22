/**
 * @description Immutable parser-neutral issue families produced by the SVG ingestion boundary.
 */
export const svgParsingIssueKinds = Object.freeze({
  /** @description Stable parser issue kind for attribute limit evidence. */
  attributeLimit: "attribute-limit",
  /** @description Stable parser issue kind for doctype evidence. */
  doctype: "doctype",
  /** @description Stable parser issue kind for element depth limit evidence. */
  elementDepthLimit: "element-depth-limit",
  /** @description Stable parser issue kind for element limit evidence. */
  elementLimit: "element-limit",
  /** @description Stable parser issue kind for entity reference evidence. */
  entityReference: "entity-reference",
  /** @description Stable parser issue kind for event handler evidence. */
  eventHandler: "event-handler",
  /** @description Stable parser issue kind for executable element evidence. */
  executableElement: "executable-element",
  /** @description Stable parser issue kind for foreign namespace evidence. */
  foreignNamespace: "foreign-namespace",
  /** @description Stable parser issue kind for malformed document evidence. */
  malformedDocument: "malformed-document",
  /** @description Stable parser issue kind for processing instruction evidence. */
  processingInstruction: "processing-instruction",
  /** @description Stable parser issue kind for path data limit evidence. */
  pathDataLimit: "path-data-limit",
  /** @description Stable parser issue kind for raster or embedded element evidence. */
  rasterOrEmbeddedElement: "raster-or-embedded-element",
  /** @description Stable parser issue kind for resource reference evidence. */
  resourceReference: "resource-reference",
  /** @description Stable parser issue kind for source limit evidence. */
  sourceLimit: "source-limit",
  /** @description Stable parser issue kind for text limit evidence. */
  textLimit: "text-limit",
  /** @description Stable parser issue kind for unsupported cdata evidence. */
  unsupportedCdata: "unsupported-cdata",
  /** @description Stable parser issue kind for unsupported element evidence. */
  unsupportedElement: "unsupported-element",
  /** @description Stable parser issue kind for unsupported text evidence. */
  unsupportedText: "unsupported-text",
  /** @description Stable parser issue kind for unsupported transform evidence. */
  unsupportedTransform: "unsupported-transform",
} as const);
