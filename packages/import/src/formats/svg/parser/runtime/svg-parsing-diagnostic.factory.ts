import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { TDiagnosticDetails } from "../../../../diagnostic/types/internal/diagnostic-details.type.js";
import type { ICanonicalSvgSource } from "../../../../source/contracts/internal/index.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";
import { diagnosticCategories } from "../../../../diagnostic/constants/diagnostic-categories.constant.js";
import { diagnosticCodes } from "../../../../diagnostic/constants/diagnostic-codes.constant.js";
import { diagnosticSeverities } from "../../../../diagnostic/constants/diagnostic-severities.constant.js";
import { SourceDiagnosticFactory } from "../../../../diagnostic/runtime/source-diagnostic.factory.js";
import { SourceLocator } from "../../../../source/runtime/source.locator.js";
import { svgParsingIssueKinds } from "../constants/svg-parsing-issue-kinds.constant.js";

/**
 * @description Maps parser-neutral SVG issues to stable Aster-owned diagnostics.
 */
export class SvgParsingDiagnosticFactory {
  /**
   * @description Stable diagnostic construction authority.
   */
  readonly #diagnosticFactory = new SourceDiagnosticFactory();

  /**
   * @description Exact UTF-16 source-position authority.
   */
  readonly #sourceLocator = new SourceLocator();

  /**
   * @description Creates one located stable diagnostic without exposing parser implementation text.
   * @param source - Canonical SVG source.
   * @param issue - Parser-neutral source issue.
   * @returns Deeply frozen blocking Aster-owned diagnostic.
   */
  create(
    source: ICanonicalSvgSource,
    issue: TSvgParsingIssue,
  ): SourceDiagnostic {
    const details = this.#details(issue);
    const startOffset = Math.max(
      0,
      Math.min(issue.startOffset, source.content.length),
    );
    const endOffset = Math.max(
      startOffset,
      Math.min(issue.endOffset, source.content.length),
    );

    return this.#diagnosticFactory.create({
      code: details.code,
      severity: diagnosticSeverities.error,
      category: details.category,
      message: details.message,
      sourceId: source.sourceId,
      span: this.#sourceLocator.span(source, startOffset, endOffset),
    });
  }

  /**
   * @description Resolves stable code, authority, and message for one issue family.
   * @param issue - Parser-neutral source issue.
   * @returns Stable diagnostic details.
   */
  #details(issue: TSvgParsingIssue): TDiagnosticDetails {
    switch (issue.kind) {
      case svgParsingIssueKinds.malformedDocument:
        return {
          code: diagnosticCodes.malformedDocument,
          category: diagnosticCategories.syntax,
          message: "The SVG source is not a well-formed single-root XML document.",
        };
      case svgParsingIssueKinds.doctype:
        return {
          code: diagnosticCodes.doctype,
          category: diagnosticCategories.safety,
          message: "Document type declarations are not accepted in SVG source.",
        };
      case svgParsingIssueKinds.entityReference:
        return {
          code: diagnosticCodes.entityReference,
          category: diagnosticCategories.safety,
          message: "Entity references are not accepted in SVG source.",
        };
      case svgParsingIssueKinds.executableElement:
        return {
          code: diagnosticCodes.executableElement,
          category: diagnosticCategories.safety,
          message: `Executable SVG element <${issue.subject}> is not accepted.`,
        };
      case svgParsingIssueKinds.rasterOrEmbeddedElement:
        return {
          code: diagnosticCodes.rasterOrEmbeddedElement,
          category: diagnosticCategories.safety,
          message: `Raster, embedded, or resolved element <${issue.subject}> is not accepted.`,
        };
      case svgParsingIssueKinds.eventHandler:
        return {
          code: diagnosticCodes.eventHandler,
          category: diagnosticCategories.safety,
          message: `Event-handler attribute ${issue.subject} is not accepted.`,
        };
      case svgParsingIssueKinds.resourceReference:
        return {
          code: diagnosticCodes.resourceReference,
          category: diagnosticCategories.safety,
          message: `Resource-bearing attribute ${issue.subject} is not accepted.`,
        };
      case svgParsingIssueKinds.foreignNamespace:
        return {
          code: diagnosticCodes.foreignNamespace,
          category: diagnosticCategories.safety,
          message: "Foreign namespace content is not accepted.",
        };
      case svgParsingIssueKinds.processingInstruction:
        return {
          code: diagnosticCodes.processingInstruction,
          category: diagnosticCategories.safety,
          message: "Processing instructions are not accepted in SVG source.",
        };
      case svgParsingIssueKinds.sourceLimit:
      case svgParsingIssueKinds.elementDepthLimit:
      case svgParsingIssueKinds.elementLimit:
      case svgParsingIssueKinds.attributeLimit:
        return {
          code: diagnosticCodes.parserLimit,
          category: diagnosticCategories.safety,
          message: "The SVG source exceeds an accepted parser safety limit.",
        };
      case svgParsingIssueKinds.unsupportedElement:
        return {
          code: diagnosticCodes.unsupportedElement,
          category: diagnosticCategories.technical,
          message: `SVG element <${issue.subject}> is outside the accepted source subset.`,
        };
      case svgParsingIssueKinds.unsupportedTransform:
        return {
          code: diagnosticCodes.unsupportedTransform,
          category: diagnosticCategories.technical,
          message: "SVG transforms are outside the accepted source subset.",
        };
      case svgParsingIssueKinds.unsupportedText:
        return {
          code: diagnosticCodes.unsupportedText,
          category: diagnosticCategories.technical,
          message: "Character data is outside the accepted SVG geometry subset.",
        };
      case svgParsingIssueKinds.unsupportedCdata:
        return {
          code: diagnosticCodes.unsupportedCdata,
          category: diagnosticCategories.technical,
          message: "CDATA sections are outside the accepted SVG source subset.",
        };
    }
  }
}
