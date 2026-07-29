import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { TSvgValidationIssue } from "../types/internal/svg-validation-issue.type.js";
import type { TSvgValidationDiagnosticDetails } from "../types/internal/svg-validation-diagnostic-details.type.js";
import { diagnosticCategories } from "../../diagnostic/constants/diagnostic-categories.constant.js";
import { diagnosticSeverities } from "../../diagnostic/constants/diagnostic-severities.constant.js";
import { SourceDiagnosticFactory } from "../../diagnostic/runtime/source-diagnostic.factory.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";

/**
 * @description Maps technical and collection-owned validation evidence to stable diagnostics.
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
      case svgValidationIssueKinds.identityDisagreement:
        return {
          code: "ASTER-TECHNICAL-007",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.technical,
          message:
            "The collection, source path, SVG, and metadata identities must agree.",
        };
      case svgValidationIssueKinds.duplicateIdentity:
        return {
          code: "ASTER-TECHNICAL-008",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.technical,
          message:
            "A canonical icon identity occurs more than once in the generation unit.",
        };
      case svgValidationIssueKinds.collectionViewBox:
        return {
          code: "ASTER-COLLECTION-001",
          severity: issue.severity,
          category: diagnosticCategories.collection,
          message:
            "The SVG viewBox differs from the collection design contract.",
        };
      case svgValidationIssueKinds.collectionStroke:
        return {
          code: "ASTER-COLLECTION-002",
          severity: issue.severity,
          category: diagnosticCategories.collection,
          message:
            "An explicit stroke width differs from the collection design contract.",
        };
      case svgValidationIssueKinds.collectionGrid:
        return {
          code: "ASTER-COLLECTION-003",
          severity: issue.severity,
          category: diagnosticCategories.collection,
          message:
            "An authored geometry value falls outside the collection construction grid.",
        };
      case svgValidationIssueKinds.collectionBounds:
        return {
          code: "ASTER-COLLECTION-004",
          severity: issue.severity,
          category: diagnosticCategories.collection,
          message:
            "Measured primitive bounds cross the collection nominal safe area.",
        };
      case svgValidationIssueKinds.collectionComplexity:
        return {
          code: "ASTER-COLLECTION-005",
          severity: issue.severity,
          category: diagnosticCategories.collection,
          message:
            "Source complexity exceeds a provisional collection limit.",
        };
    }
  }
}
