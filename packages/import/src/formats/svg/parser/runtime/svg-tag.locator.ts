import type { ICanonicalSvgSource } from "../../../../source/contracts/internal/index.js";
import type { SourceSpan } from "../../../../diagnostic/contracts/index.js";
import type { TSvgAttributeLocation } from "../types/internal/svg-attribute-location.type.js";
import type { TSvgTagLocation } from "../types/internal/svg-tag-location.type.js";
import { SvgImportError } from "../../shared/runtime/svg-import.error.js";
import { SourceLocator } from "../../../../source/runtime/source.locator.js";

/**
 * @description Recovers exact source spans from opening and closing tags already validated as XML.
 * @remarks This class locates syntax only; the selected XML parser remains responsible for
 * well-formedness.
 */
export class SvgTagLocator {
  /**
   * @description Exact UTF-16 source-position authority.
   */
  readonly #sourceLocator = new SourceLocator();

  /**
   * @description Locates one parser-validated opening tag and its authored attributes.
   * @param source - Canonical SVG source.
   * @param startOffset - Offset of the opening `<`.
   * @returns Frozen opening-tag and attribute locations in source order.
   */
  locateOpeningTag(
    source: ICanonicalSvgSource,
    startOffset: number,
  ): TSvgTagLocation {
    const content = source.content;

    if (
      content[startOffset] !== "<" ||
      content[startOffset + 1] === "/" ||
      content[startOffset + 1] === "!" ||
      content[startOffset + 1] === "?"
    ) {
      throw new SvgImportError(
        "startOffset",
        "expected a parser-validated opening tag",
      );
    }

    const endOffset = this.#openingEnd(content, startOffset);
    const nameStart = startOffset + 1;
    const nameEnd = this.#nameEnd(content, nameStart, endOffset - 1);
    const attributes: TSvgAttributeLocation[] = [];
    const names = new Set<string>();
    let duplicateAttributeName: string | undefined;
    let offset = nameEnd;

    while (offset < endOffset - 1) {
      offset = this.#skipWhitespace(content, offset, endOffset - 1);

      if (
        offset >= endOffset - 1 ||
        (content[offset] === "/" &&
          this.#skipWhitespace(content, offset + 1, endOffset - 1) ===
            endOffset - 1)
      ) {
        break;
      }

      const attributeStart = offset;
      const attributeNameEnd = this.#nameEnd(
        content,
        offset,
        endOffset - 1,
      );
      const name = content.slice(offset, attributeNameEnd);
      offset = this.#skipWhitespace(
        content,
        attributeNameEnd,
        endOffset - 1,
      );

      if (content[offset] !== "=") {
        throw new SvgImportError(
          "source",
          "parser accepted an unlocatable attribute assignment",
        );
      }

      offset = this.#skipWhitespace(content, offset + 1, endOffset - 1);
      const quote = content[offset];

      if (quote !== '"' && quote !== "'") {
        throw new SvgImportError(
          "source",
          "parser accepted an unlocatable attribute value",
        );
      }

      const valueStart = offset + 1;
      const valueEnd = content.indexOf(quote, valueStart);

      if (valueEnd < valueStart || valueEnd >= endOffset - 1) {
        throw new SvgImportError(
          "source",
          "parser accepted an unterminated attribute value",
        );
      }

      if (names.has(name) && duplicateAttributeName === undefined) {
        duplicateAttributeName = name;
      }

      names.add(name);
      offset = valueEnd + 1;
      attributes.push(
        Object.freeze({
          name,
          value: content.slice(valueStart, valueEnd),
          span: this.#sourceLocator.span(
            source,
            attributeStart,
            offset,
          ),
          nameSpan: this.#sourceLocator.span(
            source,
            attributeStart,
            attributeNameEnd,
          ),
          valueSpan: this.#sourceLocator.span(
            source,
            valueStart,
            valueEnd,
          ),
        }),
      );
    }

    return Object.freeze({
      span: this.#sourceLocator.span(source, startOffset, endOffset),
      nameSpan: this.#sourceLocator.span(source, nameStart, nameEnd),
      attributes: Object.freeze(attributes),
      ...(duplicateAttributeName === undefined
        ? {}
        : { duplicateAttributeName }),
    });
  }

  /**
   * @description Locates one parser-validated closing tag.
   * @param source - Canonical SVG source.
   * @param startOffset - Offset of the closing `<`.
   * @returns Frozen complete closing-tag span.
   */
  locateClosingTag(
    source: ICanonicalSvgSource,
    startOffset: number,
  ): SourceSpan {
    if (!source.content.startsWith("</", startOffset)) {
      throw new SvgImportError(
        "startOffset",
        "expected a parser-validated closing tag",
      );
    }

    const closingMarker = source.content.indexOf(">", startOffset + 2);

    if (closingMarker === -1) {
      throw new SvgImportError(
        "source",
        "parser accepted an unterminated closing tag",
      );
    }

    return this.#sourceLocator.span(
      source,
      startOffset,
      closingMarker + 1,
    );
  }

  /**
   * @description Finds the exclusive opening-tag end while respecting quoted attribute values.
   * @param content - Exact source content.
   * @param startOffset - Offset of the opening `<`.
   * @returns Exclusive offset immediately after `>`.
   */
  #openingEnd(content: string, startOffset: number): number {
    let quote: '"' | "'" | undefined;

    for (let offset = startOffset + 1; offset < content.length; offset += 1) {
      const unit = content[offset];

      if (quote === undefined && (unit === '"' || unit === "'")) {
        quote = unit;
      } else if (unit === quote) {
        quote = undefined;
      } else if (quote === undefined && unit === ">") {
        return offset + 1;
      }
    }

    throw new SvgImportError(
      "source",
      "parser accepted an unterminated opening tag",
    );
  }

  /**
   * @description Finds the end of one qualified XML name.
   * @param content - Exact source content.
   * @param startOffset - Inclusive qualified-name offset.
   * @param boundary - Exclusive enclosing-tag boundary.
   * @returns Exclusive qualified-name offset.
   */
  #nameEnd(
    content: string,
    startOffset: number,
    boundary: number,
  ): number {
    let offset = startOffset;

    while (
      offset < boundary &&
      !this.#isWhitespace(content[offset]) &&
      content[offset] !== "=" &&
      content[offset] !== "/" &&
      content[offset] !== ">"
    ) {
      offset += 1;
    }

    if (offset === startOffset) {
      throw new SvgImportError(
        "source",
        "parser accepted an empty qualified name",
      );
    }

    return offset;
  }

  /**
   * @description Skips XML whitespace within a known tag boundary.
   * @param content - Exact source content.
   * @param startOffset - Inclusive candidate offset.
   * @param boundary - Exclusive enclosing-tag boundary.
   * @returns First non-whitespace offset or the boundary.
   */
  #skipWhitespace(
    content: string,
    startOffset: number,
    boundary: number,
  ): number {
    let offset = startOffset;

    while (offset < boundary && this.#isWhitespace(content[offset])) {
      offset += 1;
    }

    return offset;
  }

  /**
   * @description Determines whether one source unit is XML whitespace.
   * @param unit - Source unit to inspect.
   * @returns Whether the unit is accepted XML whitespace.
   */
  #isWhitespace(unit: string | undefined): boolean {
    return unit === " " || unit === "\t" || unit === "\r" || unit === "\n";
  }
}
