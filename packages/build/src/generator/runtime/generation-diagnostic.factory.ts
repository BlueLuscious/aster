import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { TGenerationIssue } from "../types/internal/generation-issue.type.js";
import { diagnosticCategories } from "../../diagnostic/constants/diagnostic-categories.constant.js";
import { diagnosticSeverities } from "../../diagnostic/constants/diagnostic-severities.constant.js";
import { SourceDiagnosticFactory } from "../../diagnostic/runtime/source-diagnostic.factory.js";
import { generationIssueKinds } from "../constants/generation-issue-kinds.constant.js";

/**
 * @description Maps internal generation-planning evidence to stable Aster diagnostics.
 */
export class GenerationDiagnosticFactory {
  /**
   * @description Canonical Aster diagnostic construction authority.
   */
  readonly #factory = new SourceDiagnosticFactory();

  /**
   * @description Creates one stable blocking generation diagnostic.
   * @param issue - Internal generation-planning evidence.
   * @returns Deeply frozen Aster-owned diagnostic.
   */
  create(issue: TGenerationIssue): SourceDiagnostic {
    switch (issue.kind) {
      case generationIssueKinds.duplicateIdentity:
        return this.#factory.create({
          code: "ASTER-GENERATION-001",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.generation,
          message: `Portable identity ${issue.identityKey} occurs more than once.`,
          sourceId: issue.sourceId,
          related: [
            {
              message: "First generation input with this portable identity.",
              sourceId: issue.relatedSourceId,
            },
          ],
        });
      case generationIssueKinds.symbolCollision:
        return this.#factory.create({
          code: "ASTER-GENERATION-002",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.generation,
          message: `Generated TypeScript symbol ${issue.symbol} is not unique.`,
          sourceId: issue.sourceId,
          related: [
            {
              message: "First generation input producing this TypeScript symbol.",
              sourceId: issue.relatedSourceId,
            },
          ],
        });
      case generationIssueKinds.reservedSubpath:
        return this.#factory.create({
          code: "ASTER-GENERATION-003",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.generation,
          message: `Package subpath ${issue.subpath} is reserved for collection infrastructure.`,
          sourceId: issue.sourceId,
        });
      case generationIssueKinds.outputOwnership:
        return this.#factory.create({
          code: "ASTER-GENERATION-004",
          severity: diagnosticSeverities.error,
          category: diagnosticCategories.generation,
          message: `Planned output ${issue.path} would replace a file not owned by Aster generation.`,
          sourceId: issue.sourceId,
        });
    }
  }
}
