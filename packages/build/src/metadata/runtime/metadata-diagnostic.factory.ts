import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { TDiagnosticDetails } from "../../diagnostic/types/internal/diagnostic-details.type.js";
import type { TMetadataIssue } from "../types/internal/metadata-issue.type.js";
import { diagnosticCategories } from "../../diagnostic/constants/diagnostic-categories.constant.js";
import { diagnosticSeverities } from "../../diagnostic/constants/diagnostic-severities.constant.js";
import { SourceDiagnosticFactory } from "../../diagnostic/runtime/source-diagnostic.factory.js";
import { SourceLocator } from "../../source/runtime/source.locator.js";
import { metadataIssueKinds } from "../constants/metadata-issue-kinds.constant.js";

/**
 * @description Converts expected metadata failures into stable source-aware diagnostics.
 */
export class MetadataDiagnosticFactory {
  /**
   * @description Canonical diagnostic construction authority.
   */
  readonly #diagnosticFactory = new SourceDiagnosticFactory();

  /**
   * @description Exact source-location authority.
   */
  readonly #sourceLocator = new SourceLocator();

  /**
   * @description Creates one blocking metadata diagnostic.
   * @param issue - Stable metadata rejection evidence.
   * @returns Canonical source-aware error diagnostic.
   */
  create(issue: TMetadataIssue): SourceDiagnostic {
    const details = this.#details(issue);
    const span =
      issue.kind === metadataIssueKinds.duplicateKey
        ? this.#sourceLocator.span(
            issue.source,
            issue.startOffset,
            issue.endOffset,
          )
        : undefined;

    return this.#diagnosticFactory.create({
      code: details.code,
      severity: diagnosticSeverities.error,
      category: details.category,
      message: details.message,
      sourceId: issue.source.sourceId,
      ...(span === undefined ? {} : { span }),
    });
  }

  /**
   * @description Resolves stable observable details for one metadata issue family.
   * @param issue - Stable metadata rejection evidence.
   * @returns Stable diagnostic details.
   */
  #details(issue: TMetadataIssue): TDiagnosticDetails {
    switch (issue.kind) {
      case metadataIssueKinds.malformedJson:
        return {
          code: "ASTER-METADATA-001",
          category: diagnosticCategories.metadata,
          message:
            issue.reason === "resource"
              ? "Metadata JSON exceeds an accepted resource limit."
              : "Metadata source is not strict well-formed JSON.",
        };
      case metadataIssueKinds.duplicateKey:
        return {
          code: "ASTER-METADATA-002",
          category: diagnosticCategories.metadata,
          message: `Metadata object contains duplicate decoded key "${issue.subject}".`,
        };
      case metadataIssueKinds.unknownField:
        return {
          code: "ASTER-METADATA-003",
          category: diagnosticCategories.metadata,
          message: `Metadata field "${issue.subject}" is not supported by this schema.`,
        };
      case metadataIssueKinds.unsupportedVersion:
        return {
          code: "ASTER-METADATA-004",
          category: diagnosticCategories.metadata,
          message: `Metadata schema version "${issue.subject}" is not supported.`,
        };
      case metadataIssueKinds.identityDisagreement:
        return {
          code: "ASTER-METADATA-005",
          category: diagnosticCategories.metadata,
          message: `Metadata identity field "${issue.subject}" disagrees with acquired source identity.`,
        };
      case metadataIssueKinds.invalidValue:
        return {
          code: "ASTER-METADATA-006",
          category: diagnosticCategories.metadata,
          message: `Metadata value "${issue.subject}" violates its schema contract.`,
        };
    }
  }
}
