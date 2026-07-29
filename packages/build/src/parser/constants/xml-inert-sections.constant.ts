/**
 * @description Immutable XML lexical sections whose contents cannot contain active entity references.
 */
export const xmlInertSections = Object.freeze([
  Object.freeze({ opening: "<!--", closing: "-->" }),
  Object.freeze({ opening: "<![CDATA[", closing: "]]>" }),
  Object.freeze({ opening: "<?", closing: "?>" }),
]);
