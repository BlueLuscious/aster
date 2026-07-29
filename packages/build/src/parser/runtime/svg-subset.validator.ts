import type { TSvgElementInput } from "../types/internal/svg-element-input.type.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";

/**
 * @description Enforces parser-stage structural behaviour for the accepted SVG source subset.
 */
export class SvgSubsetValidator {
  /**
   * @description Supported geometry and structural element names.
   */
  readonly #supportedElements = new Set([
    "circle",
    "ellipse",
    "g",
    "line",
    "path",
    "polygon",
    "polyline",
    "rect",
  ]);

  /**
   * @description Inspects one safe element for parser-stage subset violations.
   * @param element - Parser-neutral located element input.
   * @returns Technical issues in stable semantic encounter order.
   */
  inspectElement(element: TSvgElementInput): readonly TSvgParsingIssue[] {
    const issues: TSvgParsingIssue[] = [];
    const supported =
      element.depth === 1
        ? element.localName === "svg"
        : this.#supportedElements.has(element.localName);

    if (!supported) {
      issues.push({
        kind: "unsupported-element",
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
        subject: element.name,
      });
    }

    for (const attribute of element.attributes) {
      if (attribute.localName === "transform") {
        issues.push({
          kind: "unsupported-transform",
          startOffset: attribute.span.start.offset,
          endOffset: attribute.span.end.offset,
        });
      }
    }

    return Object.freeze(issues);
  }

  /**
   * @description Classifies non-whitespace character data according to document position.
   * @param text - Decoded parser text.
   * @param startOffset - Inclusive exact source offset.
   * @param endOffset - Exclusive exact source offset.
   * @param insideRoot - Whether character data occurs inside an open root.
   * @returns A syntax or technical issue, or `undefined` for ignorable whitespace.
   */
  inspectText(
    text: string,
    startOffset: number,
    endOffset: number,
    insideRoot: boolean,
  ): TSvgParsingIssue | undefined {
    if (text.trim().length === 0) {
      return undefined;
    }

    return {
      kind: insideRoot ? "unsupported-text" : "malformed-document",
      startOffset,
      endOffset,
    };
  }
}
