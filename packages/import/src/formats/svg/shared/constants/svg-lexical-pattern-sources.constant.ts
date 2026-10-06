/**
 * @description Shared character class for the accepted SVG whitespace subset.
 */
const svgWhitespacePatternSource = String.raw`[\t\n\f\r ]`;

/**
 * @description Immutable regular-expression sources for shared SVG token and separator grammar.
 */
export const svgLexicalPatternSources = Object.freeze({
  /** @description Regular-expression source for SVG command syntax. */
  command: String.raw`^[A-Za-z]$`,
  /** @description Regular-expression source for one accepted SVG whitespace character. */
  whitespace: svgWhitespacePatternSource,
  /** @description Regular-expression source for SVG whitespace only syntax. */
  whitespaceOnly: `^${svgWhitespacePatternSource}*$`,
  /** @description Regular-expression source for SVG required whitespace syntax. */
  requiredWhitespace: `^${svgWhitespacePatternSource}+$`,
  /** @description Regular-expression source for SVG comma separator syntax. */
  commaSeparator: `^${svgWhitespacePatternSource}*,${svgWhitespacePatternSource}*$`,
});
