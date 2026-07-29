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
        | "event-handler"
        | "executable-element"
        | "raster-or-embedded-element"
        | "resource-reference"
        | "unsupported-element";

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
        | "attribute-limit"
        | "doctype"
        | "element-depth-limit"
        | "element-limit"
        | "entity-reference"
        | "foreign-namespace"
        | "malformed-document"
        | "processing-instruction"
        | "source-limit"
        | "unsupported-cdata"
        | "unsupported-text"
        | "unsupported-transform";
    }
);
