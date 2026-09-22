import { SvgRenderError } from "../../error/index.js";
import { svgXmlCharacterRanges } from "../constants/svg-xml-character-ranges.constant.js";

/**
 * @description Validates JavaScript strings against the exact XML 1.0 character repertoire.
 */
export class SvgXmlCharacterValidator {
  /**
   * @description Rejects the first code point that cannot enter XML 1.0 markup.
   * @param value - String whose complete code-point sequence is inspected.
   * @param path - Logical source path reported for unsupported content.
   * @returns Nothing.
   */
  validate(value: string, path: string): void {
    for (const character of value) {
      const codePoint = character.codePointAt(0);

      if (codePoint === undefined || !this.#isAccepted(codePoint)) {
        throw new SvgRenderError(
          path,
          "contains a character unsupported by XML 1.0",
        );
      }
    }
  }

  /**
   * @description Determines whether one Unicode code point belongs to the XML 1.0 Char production.
   * @param codePoint - Unicode code point produced from one JavaScript string iteration.
   * @returns Whether XML 1.0 accepts the code point.
   */
  #isAccepted(codePoint: number): boolean {
    return (
      codePoint === svgXmlCharacterRanges.tab ||
      codePoint === svgXmlCharacterRanges.lineFeed ||
      codePoint === svgXmlCharacterRanges.carriageReturn ||
      (codePoint >= svgXmlCharacterRanges.preSurrogateMinimum &&
        codePoint <= svgXmlCharacterRanges.preSurrogateMaximum) ||
      (codePoint >= svgXmlCharacterRanges.postSurrogateMinimum &&
        codePoint <= svgXmlCharacterRanges.postSurrogateMaximum) ||
      (codePoint >= svgXmlCharacterRanges.supplementaryMinimum &&
        codePoint <= svgXmlCharacterRanges.supplementaryMaximum)
    );
  }
}
