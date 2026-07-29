import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type {
  DiagnosticCategoryType,
  DiagnosticCodeType,
  DiagnosticSeverityType,
} from "../../diagnostic/types/index.js";
import type { TSvgValidationIssue } from "../types/internal/svg-validation-issue.type.js";
import { SourceDiagnosticFactory } from "../../diagnostic/runtime/source-diagnostic.factory.js";

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
  #details(issue: TSvgValidationIssue): {
    readonly code: DiagnosticCodeType;
    readonly severity: DiagnosticSeverityType;
    readonly category: DiagnosticCategoryType;
    readonly message: string;
  } {
    switch (issue.kind) {
      case "invalid-view-box":
        return {
          code: "ASTER-SYNTAX-002",
          severity: "error",
          category: "syntax",
          message:
            "The SVG root requires exactly four finite viewBox numbers with positive width and height.",
        };
      case "invalid-geometry":
        return {
          code: "ASTER-SYNTAX-003",
          severity: "error",
          category: "syntax",
          message:
            "An SVG geometry attribute does not follow its accepted finite numeric domain.",
        };
      case "invalid-path-data":
        return {
          code: "ASTER-SYNTAX-004",
          severity: "error",
          category: "syntax",
          message: "SVG path data does not follow the accepted path grammar.",
        };
      case "invalid-presentation":
        return {
          code: "ASTER-SYNTAX-005",
          severity: "error",
          category: "syntax",
          message:
            "An SVG presentation attribute has an unsupported or malformed value.",
        };
      case "unsupported-attribute":
        return {
          code: "ASTER-TECHNICAL-005",
          severity: "error",
          category: "technical",
          message:
            "An SVG attribute is outside the accepted portable source subset.",
        };
      case "empty-geometry":
        return {
          code: "ASTER-TECHNICAL-006",
          severity: "error",
          category: "technical",
          message: "SVG source must contain non-empty supported geometry.",
        };
      case "identity-disagreement":
        return {
          code: "ASTER-TECHNICAL-007",
          severity: "error",
          category: "technical",
          message:
            "The collection, source path, SVG, and metadata identities must agree.",
        };
      case "duplicate-identity":
        return {
          code: "ASTER-TECHNICAL-008",
          severity: "error",
          category: "technical",
          message:
            "A canonical icon identity occurs more than once in the generation unit.",
        };
      case "collection-view-box":
        return {
          code: "ASTER-COLLECTION-001",
          severity: issue.severity,
          category: "collection",
          message:
            "The SVG viewBox differs from the collection design contract.",
        };
      case "collection-stroke":
        return {
          code: "ASTER-COLLECTION-002",
          severity: issue.severity,
          category: "collection",
          message:
            "An explicit stroke width differs from the collection design contract.",
        };
      case "collection-grid":
        return {
          code: "ASTER-COLLECTION-003",
          severity: issue.severity,
          category: "collection",
          message:
            "An authored geometry value falls outside the collection construction grid.",
        };
      case "collection-bounds":
        return {
          code: "ASTER-COLLECTION-004",
          severity: issue.severity,
          category: "collection",
          message:
            "Measured primitive bounds cross the collection nominal safe area.",
        };
      case "collection-complexity":
        return {
          code: "ASTER-COLLECTION-005",
          severity: issue.severity,
          category: "collection",
          message:
            "Source complexity exceeds a provisional collection limit.",
        };
    }
  }
}
