/**
 * @description Immutable regular-expression sources for shared SVG token and separator grammar.
 */
export const svgLexicalPatternSources = Object.freeze({
  /** @description Regular-expression source for SVG command syntax. */
  command: String.raw`^[A-Za-z]$`,
  /** @description Regular-expression source for SVG whitespace only syntax. */
  whitespaceOnly: String.raw`^[\t\n\f\r ]*$`,
  /** @description Regular-expression source for SVG required whitespace syntax. */
  requiredWhitespace: String.raw`^[\t\n\f\r ]+$`,
  /** @description Regular-expression source for SVG comma separator syntax. */
  commaSeparator: String.raw`^[\t\n\f\r ]*,[\t\n\f\r ]*$`,
});
