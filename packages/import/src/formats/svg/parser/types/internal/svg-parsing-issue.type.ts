import type { svgParsingIssueKinds } from "../../constants/svg-parsing-issue-kinds.constant.js";

/**
 * @description Parser-neutral internal evidence used to create one stable SVG ingestion diagnostic.
 */
export type TSvgParsingIssue = {
  /**
   * @description Inclusive zero-based UTF-16 evidence offset.
   */
  readonly startOffset: number;

  /**
   * @description Exclusive zero-based UTF-16 evidence offset.
   */
  readonly endOffset: number;
} & (
  | {
      /**
       * @description Issue family whose stable message includes an exact XML name.
       */
      readonly kind:
        | typeof svgParsingIssueKinds.eventHandler
        | typeof svgParsingIssueKinds.executableElement
        | typeof svgParsingIssueKinds.rasterOrEmbeddedElement
        | typeof svgParsingIssueKinds.resourceReference
        | typeof svgParsingIssueKinds.unsupportedElement;

      /**
       * @description Exact parser-validated XML name safe for a single-line diagnostic message.
       */
      readonly subject: string;
    }
  | {
      /**
       * @description Issue family that requires no source text in its stable message.
       */
      readonly kind:
        | typeof svgParsingIssueKinds.attributeLimit
        | typeof svgParsingIssueKinds.doctype
        | typeof svgParsingIssueKinds.elementDepthLimit
        | typeof svgParsingIssueKinds.elementLimit
        | typeof svgParsingIssueKinds.entityReference
        | typeof svgParsingIssueKinds.foreignNamespace
        | typeof svgParsingIssueKinds.malformedDocument
        | typeof svgParsingIssueKinds.processingInstruction
        | typeof svgParsingIssueKinds.sourceLimit
        | typeof svgParsingIssueKinds.unsupportedCdata
        | typeof svgParsingIssueKinds.unsupportedText
        | typeof svgParsingIssueKinds.unsupportedTransform;
    }
);
