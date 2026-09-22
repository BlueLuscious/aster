/**
 * @description Immutable XML lexical sections whose contents cannot contain active entity references.
 */
export const xmlInertSections = Object.freeze({
  /** @description Lexical delimiters for XML comment sections. */
  comment: Object.freeze({
    /** @description Opening delimiter for this inert XML section. */
    opening: "<!--",
    /** @description Closing delimiter for this inert XML section. */
    closing: "-->",
  }),
  /** @description Lexical delimiters for XML cdata sections. */
  cdata: Object.freeze({
    /** @description Opening delimiter for this inert XML section. */
    opening: "<![CDATA[",
    /** @description Closing delimiter for this inert XML section. */
    closing: "]]>",
  }),
  /** @description Lexical delimiters for XML processing instruction sections. */
  processingInstruction: Object.freeze({
    /** @description Opening delimiter for this inert XML section. */
    opening: "<?",
    /** @description Closing delimiter for this inert XML section. */
    closing: "?>",
  }),
});
