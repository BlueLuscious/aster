/**
 * @description Immutable regular-expression sources for shared SVG token and separator grammar.
 */
export const svgLexicalPatternSources = Object.freeze({
  command: String.raw`^[A-Za-z]$`,
  whitespaceOnly: String.raw`^\s*$`,
  requiredWhitespace: String.raw`^\s+$`,
  commaSeparator: String.raw`^\s*,\s*$`,
});
