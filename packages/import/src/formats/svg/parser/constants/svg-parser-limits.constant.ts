/**
 * @description Fixed safety limits applied before untrusted SVG syntax can enter later import stages.
 */
export const svgParserLimits = Object.freeze({
  maxSourceLength: 1_048_576,
  maxElementDepth: 64,
  maxElements: 10_000,
  maxAttributesPerElement: 128,
});
