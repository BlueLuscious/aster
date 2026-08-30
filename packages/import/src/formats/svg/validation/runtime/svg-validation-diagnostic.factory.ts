import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { TDiagnosticDetails } from "../../../../diagnostic/types/internal/diagnostic-details.type.js";
import type { TSvgValidationIssue } from "../types/internal/svg-validation-issue.type.js";
import { diagnosticCodes } from "../../../../diagnostic/constants/diagnostic-codes.constant.js";
import { SourceDiagnosticFactory } from "../../../../diagnostic/runtime/source-diagnostic.factory.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";

/**
 * @description Maps technical SVG validation evidence to stable diagnostics.
 */
export class SvgValidationDiagnosticFactory {
  /**
   * @description Stable diagnostic construction authority.
   */
  readonly #factory = new SourceDiagnosticFactory();

  /**
   * @description Creates one immutable validation diagnostic.
   * @param issue - Internal stable validation evidence.
   * @returns Deeply frozen Aster-owned diagnostic.
   */
  create(issue: TSvgValidationIssue): SourceDiagnostic {
    const details = this.#details(issue);

    return this.#factory.create({
      code: details.code,
      message: details.message,
      sourceId: issue.sourceId,
      ...("span" in issue && issue.span !== undefined
        ? { span: issue.span }
        : {}),
    });
  }

  /**
   * @description Resolves stable observable details for one validation issue family.
   * @param issue - Internal stable validation evidence.
   * @returns Stable code, severity, category, and message.
   */
  #details(
    issue: TSvgValidationIssue,
  ): TDiagnosticDetails {
    switch (issue.kind) {
      case svgValidationIssueKinds.invalidViewBox:
        return {
          code: diagnosticCodes.invalidViewBox,
          message:
            "The SVG root requires exactly four finite viewBox numbers with positive width and height.",
        };
      case svgValidationIssueKinds.invalidGeometry:
        return {
          code: diagnosticCodes.invalidGeometry,
          message:
            "An SVG geometry attribute does not follow its accepted finite numeric domain.",
        };
      case svgValidationIssueKinds.invalidPathData:
        return {
          code: diagnosticCodes.invalidPathData,
          message: "SVG path data does not follow the accepted path grammar.",
        };
      case svgValidationIssueKinds.invalidPresentation:
        return {
          code: diagnosticCodes.invalidPresentation,
          message:
            "An SVG presentation attribute has an unsupported or malformed value.",
        };
      case svgValidationIssueKinds.unsupportedAttribute:
        return {
          code: diagnosticCodes.unsupportedAttribute,
          message:
            "An SVG attribute is outside the accepted portable source subset.",
        };
      case svgValidationIssueKinds.emptyGeometry:
        return {
          code: diagnosticCodes.emptyGeometry,
          message: "SVG source must contain non-empty supported geometry.",
        };
      case svgValidationIssueKinds.discardedEditorAttribute:
        return {
          code: diagnosticCodes.discardedEditorAttribute,
          message:
            "A safe root editor attribute was reviewed and omitted from the portable definition.",
        };
    }
  }
}
