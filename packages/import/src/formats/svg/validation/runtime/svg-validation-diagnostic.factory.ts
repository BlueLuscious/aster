import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { TSvgValidationIssue } from "../types/internal/svg-validation-issue.type.js";
import type { TSvgValidationDiagnosticDetails } from "../types/internal/svg-validation-diagnostic-details.type.js";
import { diagnosticCategories } from "../../../../diagnostic/constants/diagnostic-categories.constant.js";
import { diagnosticSeverities } from "../../../../diagnostic/constants/diagnostic-severities.constant.js";
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
      severity: details.severity,
      category: details.category,
      message: details.message,
      sourceId: issue.sourceId,
      ...("span" in issue && issue.span !== undefined
        ? { span: issue.span }
        : {}),
      ...("related" in issue && issue.related !== undefined
        ? { related: issue.related }
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
  ): TSvgValidationDiagnosticDetails {
    switch (issue.kind) {
      case svgValidationIssueKinds.invalidViewBox:
        return {
          code: "ASTER-SYNTAX-002",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.syntax,
          message:
            "The SVG root requires exactly four finite viewBox numbers with positive width and height.",
        };
      case svgValidationIssueKinds.invalidGeometry:
        return {
          code: "ASTER-SYNTAX-003",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.syntax,
          message:
            "An SVG geometry attribute does not follow its accepted finite numeric domain.",
        };
      case svgValidationIssueKinds.invalidPathData:
        return {
          code: "ASTER-SYNTAX-004",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.syntax,
          message: "SVG path data does not follow the accepted path grammar.",
        };
      case svgValidationIssueKinds.invalidPresentation:
        return {
          code: "ASTER-SYNTAX-005",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.syntax,
          message:
            "An SVG presentation attribute has an unsupported or malformed value.",
        };
      case svgValidationIssueKinds.unsupportedAttribute:
        return {
          code: "ASTER-TECHNICAL-005",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.technical,
          message:
            "An SVG attribute is outside the accepted portable source subset.",
        };
      case svgValidationIssueKinds.emptyGeometry:
        return {
          code: "ASTER-TECHNICAL-006",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.technical,
          message: "SVG source must contain non-empty supported geometry.",
        };
      case svgValidationIssueKinds.discardedEditorAttribute:
        return {
          code: "ASTER-TECHNICAL-007",
          severity: diagnosticSeverities.warning,
          category: diagnosticCategories.technical,
          message:
            "A safe root editor attribute was reviewed and omitted from the portable definition.",
        };
    }
  }
}
