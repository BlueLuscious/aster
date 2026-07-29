import type { TSvgElementInput } from "../types/internal/svg-element-input.type.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";

/**
 * @description Identifies blocking executable, embedded, external, and foreign SVG source risks.
 */
export class SvgSafetyValidator {
  /**
   * @description Sole namespace accepted for SVG elements.
   */
  readonly #svgNamespace = "http://www.w3.org/2000/svg";

  /**
   * @description Namespace declaration URI accepted only for namespace attributes.
   */
  readonly #namespaceDeclarationUri = "http://www.w3.org/2000/xmlns/";

  /**
   * @description Executable or host-interactive element names.
   */
  readonly #executableElements = new Set([
    "a",
    "script",
    "set",
    "style",
    "animate",
    "animateMotion",
    "animateTransform",
  ]);

  /**
   * @description Raster, embedded-document, or externally resolved element names.
   */
  readonly #embeddedElements = new Set([
    "audio",
    "canvas",
    "embed",
    "feImage",
    "foreignObject",
    "iframe",
    "image",
    "link",
    "object",
    "use",
    "video",
  ]);

  /**
   * @description Inspects one located element without granting trust to its syntax.
   * @param element - Parser-neutral located element input.
   * @returns Blocking safety issues in stable semantic encounter order.
   */
  inspect(element: TSvgElementInput): readonly TSvgParsingIssue[] {
    const issues: TSvgParsingIssue[] = [];

    if (element.namespaceUri !== this.#svgNamespace) {
      issues.push({
        kind: "foreign-namespace",
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
      });
    }

    if (this.#executableElements.has(element.localName)) {
      issues.push({
        kind: "executable-element",
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
        subject: element.name,
      });
    } else if (this.#embeddedElements.has(element.localName)) {
      issues.push({
        kind: "raster-or-embedded-element",
        startOffset: element.nameSpan.start.offset,
        endOffset: element.nameSpan.end.offset,
        subject: element.name,
      });
    }

    for (const attribute of element.attributes) {
      if (
        attribute.namespaceUri !== "" &&
        attribute.namespaceUri !== this.#namespaceDeclarationUri
      ) {
        issues.push({
          kind: "foreign-namespace",
          startOffset: attribute.nameSpan.start.offset,
          endOffset: attribute.nameSpan.end.offset,
        });
      }

      if (
        attribute.namespaceUri === this.#namespaceDeclarationUri &&
        !(
          attribute.name === "xmlns" &&
          attribute.value === this.#svgNamespace
        )
      ) {
        issues.push({
          kind: "foreign-namespace",
          startOffset: attribute.span.start.offset,
          endOffset: attribute.span.end.offset,
        });
      }

      if (/^on/iu.test(attribute.localName)) {
        issues.push({
          kind: "event-handler",
          startOffset: attribute.nameSpan.start.offset,
          endOffset: attribute.nameSpan.end.offset,
          subject: attribute.name,
        });
      }

      if (
        attribute.localName === "href" ||
        attribute.localName === "src" ||
        /url\s*\(/iu.test(attribute.value)
      ) {
        issues.push({
          kind: "resource-reference",
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
      this.#executableElements.has(localName) ||
      this.#embeddedElements.has(localName)
    );
  }
}
