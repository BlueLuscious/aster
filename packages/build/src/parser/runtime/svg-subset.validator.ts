import type { TSvgElementInput } from "../types/internal/svg-element-input.type.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgSourceElementSchema } from "../../shared/constants/svg-source-element-schema.constant.js";
import { svgSourceElementRoles } from "../../shared/constants/svg-source-element-roles.constant.js";
import { svgParsingIssueKinds } from "../constants/svg-parsing-issue-kinds.constant.js";

/**
 * @description Enforces parser-stage structural behaviour for the accepted SVG source subset.
 */
export class SvgSubsetValidator {
  /**
   * @description Inspects one safe element for parser-stage subset violations.
   * @param element - Parser-neutral located element input.
   * @returns Technical issues in stable semantic encounter order.
   */
  inspectElement(element: TSvgElementInput): readonly TSvgParsingIssue[] {
    const issues: TSvgParsingIssue[] = [];
    const schema = this.#schema(element.localName);
    const supported =
      schema !== undefined &&
      (element.depth === 1
        ? schema.role === svgSourceElementRoles.root
        : schema.role !== svgSourceElementRoles.root);

    if (!supported) {
      issues.push({
        kind: svgParsingIssueKinds.unsupportedElement,
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
        subject: element.name,
      });
    }

    for (const attribute of element.attributes) {
      if (
        attribute.localName === svgSourceAttributeNames.transform
      ) {
        issues.push({
          kind: svgParsingIssueKinds.unsupportedTransform,
          startOffset: attribute.span.start.offset,
          endOffset: attribute.span.end.offset,
        });
      }
    }

    return Object.freeze(issues);
  }

  /**
   * @description Resolves one accepted source-element schema entry.
   * @param localName - Namespace-free SVG element name.
   * @returns Matching immutable schema entry, or `undefined` when unsupported.
   */
  #schema(
    localName: string,
  ):
    | (typeof svgSourceElementSchema)[keyof typeof svgSourceElementSchema]
    | undefined {
    if (!Object.hasOwn(svgSourceElementSchema, localName)) {
      return undefined;
    }

    return svgSourceElementSchema[
      localName as keyof typeof svgSourceElementSchema
    ];
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
      kind: insideRoot
        ? svgParsingIssueKinds.unsupportedText
        : svgParsingIssueKinds.malformedDocument,
      startOffset,
      endOffset,
    };
  }
}
