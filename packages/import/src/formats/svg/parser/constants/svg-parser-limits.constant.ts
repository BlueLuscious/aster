/**
 * @description Fixed safety limits applied before untrusted SVG syntax can enter later import stages.
 */
export const svgParserLimits = Object.freeze({
  /** @description Maximum source length in UTF-16 code units. */
  maxSourceLength: 1_048_576,
  /** @description Maximum one-based element nesting depth. */
  maxElementDepth: 64,
  /** @description Maximum element count in one source. */
  maxElements: 10_000,
  /** @description Maximum attributes on one element. */
  maxAttributesPerElement: 128,
  /** @description Maximum raw character-data length in UTF-16 code units. */
  maxTextLength: 262_144,
  /** @description Maximum path-data attribute length in UTF-16 code units. */
  maxPathDataLength: 262_144,
});
