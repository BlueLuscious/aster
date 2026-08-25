/**
 * @description Immutable XML 1.0 character ranges accepted by SVG markup serialisation.
 */
export const svgXmlCharacterRanges = Object.freeze({
  /** @description XML horizontal tab code point. */
  tab: 0x09,
  /** @description XML line-feed code point. */
  lineFeed: 0x0a,
  /** @description XML carriage-return code point. */
  carriageReturn: 0x0d,
  /** @description Inclusive lower bound before the UTF-16 surrogate block. */
  preSurrogateMinimum: 0x20,
  /** @description Inclusive upper bound before the UTF-16 surrogate block. */
  preSurrogateMaximum: 0xd7ff,
  /** @description Inclusive lower bound after the UTF-16 surrogate block. */
  postSurrogateMinimum: 0xe000,
  /** @description Inclusive XML BMP upper bound. */
  postSurrogateMaximum: 0xfffd,
  /** @description Inclusive supplementary-plane lower bound. */
  supplementaryMinimum: 0x10000,
  /** @description Inclusive Unicode upper bound. */
  supplementaryMaximum: 0x10ffff,
});
