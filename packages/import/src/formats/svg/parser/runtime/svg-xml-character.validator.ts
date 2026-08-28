/**
 * @description Validates exact source code points against the accepted XML 1.0 character set.
 */
export class SvgXmlCharacterValidator {
  /**
   * @description Finds the first source offset that cannot occur in an XML 1.0 document.
   * @param content - Exact canonical SVG content.
   * @returns Zero-based UTF-16 offset of the first invalid code point, or `undefined`.
   */
  firstInvalidOffset(content: string): number | undefined {
    for (let offset = 0; offset < content.length; offset += 1) {
      const codePoint = content.codePointAt(offset);

      if (codePoint === undefined || !this.#isAccepted(codePoint)) {
        return offset;
      }

      if (codePoint > 0xffff) {
        offset += 1;
      }
    }

    return undefined;
  }

  /**
   * @description Determines whether one Unicode code point belongs to the XML 1.0 character set.
   * @param codePoint - Unicode scalar value.
   * @returns Whether XML 1.0 permits the code point.
   */
  #isAccepted(codePoint: number): boolean {
    return (
      codePoint === 0x09 ||
      codePoint === 0x0a ||
      codePoint === 0x0d ||
      (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
      (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
      (codePoint >= 0x10000 && codePoint <= 0x10ffff)
    );
  }
}
