import type { TSvgElementInput } from "../types/internal/svg-element-input.type.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgNamespaces } from "../constants/svg-namespaces.constant.js";
import { svgParsingIssueKinds } from "../constants/svg-parsing-issue-kinds.constant.js";
import { svgSafetyAttributePolicy } from "../constants/svg-safety-attribute-policy.constant.js";
import { svgSafetyElements } from "../constants/svg-safety-elements.constant.js";

/**
 * @description Identifies blocking executable, embedded, external, and foreign SVG source risks.
 */
export class SvgSafetyValidator {
  /**
   * @description Attribute-name grammar for executable event handlers.
   */
  readonly #eventHandlerPattern = new RegExp(
    svgSafetyAttributePolicy.eventHandlerPatternSource,
    "iu",
  );

  /**
   * @description Attribute-value grammar for resource-bearing CSS references.
   */
  readonly #valueReferencePattern = new RegExp(
    svgSafetyAttributePolicy.valueReferencePatternSource,
    "iu",
  );

  /**
   * @description Inspects one located element without granting trust to its syntax.
   * @param element - Parser-neutral located element input.
   * @returns Blocking safety issues in stable semantic encounter order.
   */
  inspect(element: TSvgElementInput): readonly TSvgParsingIssue[] {
    const issues: TSvgParsingIssue[] = [];

    if (element.namespaceUri !== svgNamespaces.element) {
      issues.push({
        kind: svgParsingIssueKinds.foreignNamespace,
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
      });
    }

    if (svgSafetyElements.executable.includes(element.localName)) {
      issues.push({
        kind: svgParsingIssueKinds.executableElement,
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
        subject: element.name,
      });
    } else if (svgSafetyElements.embedded.includes(element.localName)) {
      issues.push({
        kind: svgParsingIssueKinds.rasterOrEmbeddedElement,
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
        subject: element.name,
      });
    }

    for (const attribute of element.attributes) {
      if (
        attribute.namespaceUri !== "" &&
        attribute.namespaceUri !== svgNamespaces.declaration
      ) {
        issues.push({
          kind: svgParsingIssueKinds.foreignNamespace,
          startOffset: attribute.nameSpan.start.offset,
          endOffset: attribute.nameSpan.end.offset,
        });
      }

      if (
        attribute.namespaceUri === svgNamespaces.declaration &&
        !(
          attribute.name ===
            svgSourceAttributeNames.namespaceDeclaration &&
          attribute.value === svgNamespaces.element
        )
      ) {
        issues.push({
          kind: svgParsingIssueKinds.foreignNamespace,
          startOffset: attribute.span.start.offset,
          endOffset: attribute.span.end.offset,
        });
      }

      if (this.#eventHandlerPattern.test(attribute.localName)) {
        issues.push({
          kind: svgParsingIssueKinds.eventHandler,
          startOffset: attribute.nameSpan.start.offset,
          endOffset: attribute.nameSpan.end.offset,
          subject: attribute.name,
        });
      }

      if (
        (svgSafetyAttributePolicy.resourceNames as readonly string[]).includes(
          attribute.localName,
        ) ||
        this.#valueReferencePattern.test(attribute.value)
      ) {
        issues.push({
          kind: svgParsingIssueKinds.resourceReference,
          startOffset: attribute.span.start.offset,
          endOffset: attribute.span.end.offset,
          subject: attribute.name,
        });
      }
    }

    return Object.freeze(issues);
  }

  /**
   * @description Determines whether an element kind is rejected specifically for safety.
   * @param localName - Namespace-independent element name.
   * @returns Whether the name denotes executable, raster, embedded, or resolved content.
   */
  rejectsElement(localName: string): boolean {
    return (
      svgSafetyElements.executable.includes(localName) ||
      svgSafetyElements.embedded.includes(localName)
    );
  }
}
