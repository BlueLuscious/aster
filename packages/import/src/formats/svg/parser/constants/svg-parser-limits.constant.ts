/**
 * @description Fixed safety limits applied before untrusted SVG syntax can enter later import stages.
 */
export const svgParserLimits = Object.freeze({
  /** @description Maximum accepted max source length before parsing is rejected. */
  maxSourceLength: 1_048_576,
  /** @description Maximum accepted max element depth before parsing is rejected. */
  maxElementDepth: 64,
  /** @description Maximum accepted max elements before parsing is rejected. */
  maxElements: 10_000,
  /** @description Maximum accepted max attributes per element before parsing is rejected. */
  maxAttributesPerElement: 128,
  /** @description Maximum accepted max text length before parsing is rejected. */
  maxTextLength: 262_144,
  /** @description Maximum accepted max path data length before parsing is rejected. */
  maxPathDataLength: 262_144,
});
