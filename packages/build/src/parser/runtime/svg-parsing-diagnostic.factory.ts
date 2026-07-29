import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type {
  DiagnosticCategoryType,
  DiagnosticCodeType,
} from "../../diagnostic/types/index.js";
import type { CanonicalSvgSource } from "../../source/contracts/index.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";
import { SourceDiagnosticFactory } from "../../diagnostic/runtime/source-diagnostic.factory.js";
import { SourceLocator } from "../../source/runtime/source.locator.js";

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
    source: CanonicalSvgSource,
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
      severity: "error",
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
  #details(issue: TSvgParsingIssue): {
    readonly code: DiagnosticCodeType;
    readonly category: DiagnosticCategoryType;
    readonly message: string;
  } {
    switch (issue.kind) {
      case "malformed-document":
        return {
          code: "ASTER-SYNTAX-001",
          category: "syntax",
          message: "The SVG source is not a well-formed single-root XML document.",
        };
      case "doctype":
        return {
          code: "ASTER-SAFETY-001",
          category: "safety",
          message: "Document type declarations are not accepted in SVG source.",
        };
      case "entity-reference":
        return {
          code: "ASTER-SAFETY-002",
          category: "safety",
          message: "Entity references are not accepted in SVG source.",
        };
      case "executable-element":
        return {
          code: "ASTER-SAFETY-003",
          category: "safety",
          message: `Executable SVG element <${issue.subject}> is not accepted.`,
        };
      case "raster-or-embedded-element":
        return {
          code: "ASTER-SAFETY-004",
          category: "safety",
          message: `Raster, embedded, or resolved element <${issue.subject}> is not accepted.`,
        };
      case "event-handler":
        return {
          code: "ASTER-SAFETY-005",
          category: "safety",
          message: `Event-handler attribute ${issue.subject} is not accepted.`,
        };
      case "resource-reference":
        return {
          code: "ASTER-SAFETY-006",
          category: "safety",
          message: `Resource-bearing attribute ${issue.subject} is not accepted.`,
        };
      case "foreign-namespace":
        return {
          code: "ASTER-SAFETY-007",
          category: "safety",
          message: "Foreign namespace content is not accepted.",
        };
      case "processing-instruction":
        return {
          code: "ASTER-SAFETY-008",
          category: "safety",
          message: "Processing instructions are not accepted in SVG source.",
        };
      case "source-limit":
      case "element-depth-limit":
      case "element-limit":
      case "attribute-limit":
        return {
          code: "ASTER-SAFETY-009",
          category: "safety",
          message: "The SVG source exceeds an accepted parser safety limit.",
        };
      case "unsupported-element":
        return {
          code: "ASTER-TECHNICAL-001",
          category: "technical",
          message: `SVG element <${issue.subject}> is outside the accepted source subset.`,
        };
      case "unsupported-transform":
        return {
          code: "ASTER-TECHNICAL-002",
          category: "technical",
          message: "SVG transforms are outside the accepted source subset.",
        };
      case "unsupported-text":
        return {
          code: "ASTER-TECHNICAL-003",
          category: "technical",
          message: "Character data is outside the accepted SVG geometry subset.",
        };
      case "unsupported-cdata":
        return {
          code: "ASTER-TECHNICAL-004",
          category: "technical",
          message: "CDATA sections are outside the accepted SVG source subset.",
        };
    }
  }
}
