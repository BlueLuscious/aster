/**
 * @description Immutable XML lexical sections whose contents cannot contain active entity references.
 */
export const xmlInertSections = Object.freeze({
  comment: Object.freeze({ opening: "<!--", closing: "-->" }),
  cdata: Object.freeze({ opening: "<![CDATA[", closing: "]]>" }),
  processingInstruction: Object.freeze({
    opening: "<?",
    closing: "?>",
  }),
});
