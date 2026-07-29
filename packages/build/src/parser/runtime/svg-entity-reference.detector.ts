/**
 * @description Finds entity-reference markers that would be expanded while ignoring inert comments and CDATA.
 */
export class SvgEntityReferenceDetector {
  /**
   * @description Finds all entity-reference marker offsets outside inert lexical sections.
   * @param content - Exact canonical SVG content.
   * @returns Frozen zero-based UTF-16 offsets in source order.
   */
  detect(content: string): readonly number[] {
    const offsets: number[] = [];
    let offset = 0;

    while (offset < content.length) {
      const inertEnd = this.#inertEnd(content, offset);

      if (inertEnd !== undefined) {
        offset = inertEnd;
      } else {
        if (content[offset] === "&") {
          offsets.push(offset);
        }

        offset += 1;
      }
    }

    return Object.freeze(offsets);
  }

  /**
   * @description Resolves the end of an inert comment, CDATA section, or processing instruction.
   * @param content - Exact canonical SVG content.
   * @param offset - Candidate lexical opening offset.
   * @returns Exclusive inert-section end, or `undefined` when ordinary XML begins at the offset.
   */
  #inertEnd(content: string, offset: number): number | undefined {
    const sections = [
      { opening: "<!--", closing: "-->" },
      { opening: "<![CDATA[", closing: "]]>" },
      { opening: "<?", closing: "?>" },
    ];

    for (const section of sections) {
      if (content.startsWith(section.opening, offset)) {
        const closingOffset = content.indexOf(
          section.closing,
          offset + section.opening.length,
        );

        return closingOffset === -1
          ? content.length
          : closingOffset + section.closing.length;
      }
    }

    return undefined;
  }
}
