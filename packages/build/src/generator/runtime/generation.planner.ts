import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import type { IGenerationPlan } from "../contracts/internal/generation-plan.contract.js";
import type { IGenerationPlanner } from "../contracts/internal/generation-planner.contract.js";
import type { IGenerationRequest } from "../contracts/internal/generation-request.contract.js";
import type { IPlannedFile } from "../contracts/internal/planned-file.contract.js";
import type { IPlannedPackageExport } from "../contracts/internal/planned-package-export.contract.js";
import type { TGenerationCandidate } from "../types/internal/generation-candidate.type.js";
import type { TGenerationIssue } from "../types/internal/generation-issue.type.js";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { generationIssueKinds } from "../constants/generation-issue-kinds.constant.js";
import { generatorModulePaths } from "../constants/generator-module-paths.constant.js";
import { generatorReservedSubpaths } from "../constants/generator-reserved-subpaths.constant.js";
import { CollectionIndexTemplate } from "./collection-index.template.js";
import { CollectionManifestTemplate } from "./collection-manifest.template.js";
import { GeneratedCleanupPlanner } from "./generated-cleanup.planner.js";
import { GeneratedIconNameFactory } from "./generated-icon-name.factory.js";
import { GenerationDiagnosticFactory } from "./generation-diagnostic.factory.js";
import { GenerationRequestNormaliser } from "./generation-request.normaliser.js";
import { IconModuleTemplate } from "./icon-module.template.js";

/**
 * @description Plans complete deterministic collection modules without filesystem authority.
 */
export class GenerationPlanner implements IGenerationPlanner {
  /**
   * @description Generation request validation and isolation authority.
   */
  readonly #requestNormaliser = new GenerationRequestNormaliser();

  /**
   * @description Portable identity to generated-name authority.
   */
  readonly #nameFactory = new GeneratedIconNameFactory();

  /**
   * @description Isolated portable-definition module template.
   */
  readonly #iconTemplate = new IconModuleTemplate();

  /**
   * @description Collection root export template.
   */
  readonly #indexTemplate = new CollectionIndexTemplate();

  /**
   * @description Opt-in collection manifest template.
   */
  readonly #manifestTemplate = new CollectionManifestTemplate();

  /**
   * @description Existing generated-file cleanup analysis.
   */
  readonly #cleanupPlanner = new GeneratedCleanupPlanner();

  /**
   * @description Stable generation diagnostic authority.
   */
  readonly #diagnosticFactory = new GenerationDiagnosticFactory();

  /**
   * @description Explicit diagnostic-bearing result authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Creates a complete plan or blocking generation diagnostics without host effects.
   * @param request - Successful normalised collection generation input.
   * @returns Complete immutable plan or blocking diagnostics without partial output.
   */
  plan(
    request: IGenerationRequest,
  ): DiagnosticResultType<IGenerationPlan> {
    const accepted = this.#requestNormaliser.normalise(request);
    const candidates = accepted.entries
      .map((entry) =>
        Object.freeze({
          entry,
          name: this.#nameFactory.create(entry.definition),
        }),
      )
      .sort((left, right) =>
        this.#compareText(left.name.identityKey, right.name.identityKey),
      );
    const issues = this.#collectIssues(candidates);
    const files = this.#createFiles(
      candidates,
      accepted.collectionSourceId,
    );
    const cleanup = this.#cleanupPlanner.plan(
      accepted.existingFiles ?? [],
      files,
    );

    issues.push(
      ...cleanup.conflictingPaths.map<TGenerationIssue>((path) => ({
        kind: generationIssueKinds.outputOwnership,
        sourceId: path,
        path,
      })),
    );

    if (issues.length > 0) {
      return this.#resultFactory.failure(
        issues.map((issue) => this.#diagnosticFactory.create(issue)),
      );
    }

    const plan = Object.freeze({
      collection: accepted.collection,
      packageName: accepted.packageName,
      files,
      exports: this.#createExports(candidates),
      stalePaths: cleanup.stalePaths,
    });

    return this.#resultFactory.success(plan);
  }

  /**
   * @description Collects identity, symbol, and reserved-subpath issues in semantic order.
   * @param candidates - Canonically ordered generation candidates.
   * @returns Mutable issue collection consumed immediately by planning.
   */
  #collectIssues(
    candidates: readonly TGenerationCandidate[],
  ): TGenerationIssue[] {
    const issues: TGenerationIssue[] = [];
    const identitySources = new Map<string, string>();
    const symbolSources = new Map<string, string>();

    for (const candidate of candidates) {
      const previousIdentity = identitySources.get(candidate.name.identityKey);

      if (previousIdentity !== undefined) {
        issues.push({
          kind: generationIssueKinds.duplicateIdentity,
          sourceId: candidate.entry.sourceId,
          identityKey: candidate.name.identityKey,
          relatedSourceId: previousIdentity,
        });
        continue;
      }

      identitySources.set(
        candidate.name.identityKey,
        candidate.entry.sourceId,
      );
      const firstSubpath = candidate.name.manifestKey.split("/")[0];

      if (
        firstSubpath !== undefined &&
        (generatorReservedSubpaths as readonly string[]).includes(firstSubpath)
      ) {
        issues.push({
          kind: generationIssueKinds.reservedSubpath,
          sourceId: candidate.entry.sourceId,
          subpath: `./${firstSubpath}`,
        });
      }

      const previousSymbol = symbolSources.get(candidate.name.symbol);

      if (previousSymbol === undefined) {
        symbolSources.set(candidate.name.symbol, candidate.entry.sourceId);
      } else {
        issues.push({
          kind: generationIssueKinds.symbolCollision,
          sourceId: candidate.entry.sourceId,
          symbol: candidate.name.symbol,
          relatedSourceId: previousSymbol,
        });
      }
    }

    return issues;
  }

  /**
   * @description Renders and orders the complete generated TypeScript file set.
   * @param candidates - Canonically ordered generation candidates.
   * @param collectionSourceId - Canonical collection metadata provenance.
   * @returns Frozen generated file collection ordered by path.
   */
  #createFiles(
    candidates: readonly TGenerationCandidate[],
    collectionSourceId: string,
  ): readonly IPlannedFile[] {
    const sourceIds = [
      collectionSourceId,
      ...candidates.map((candidate) => candidate.entry.sourceId),
    ];
    const files: IPlannedFile[] = [
      ...candidates.map((candidate) =>
        Object.freeze({
          path: candidate.name.modulePath,
          content: this.#iconTemplate.render(candidate),
        }),
      ),
      Object.freeze({
        path: generatorModulePaths.root,
        content: this.#indexTemplate.render(candidates, sourceIds),
      }),
      Object.freeze({
        path: generatorModulePaths.manifest,
        content: this.#manifestTemplate.render(candidates, sourceIds),
      }),
    ];

    files.sort((left, right) => this.#compareText(left.path, right.path));
    return Object.freeze(files);
  }

  /**
   * @description Creates and orders the complete public package export plan.
   * @param candidates - Canonically ordered generation candidates.
   * @returns Frozen export collection ordered by subpath.
   */
  #createExports(
    candidates: readonly TGenerationCandidate[],
  ): readonly IPlannedPackageExport[] {
    const exports: IPlannedPackageExport[] = [
      Object.freeze({
        subpath: ".",
        sourcePath: generatorModulePaths.root,
      }),
      ...candidates.map((candidate) =>
        Object.freeze({
          subpath: candidate.name.publicSubpath,
          sourcePath: candidate.name.modulePath,
        }),
      ),
      Object.freeze({
        subpath: "./manifest",
        sourcePath: generatorModulePaths.manifest,
      }),
    ];

    exports.sort((left, right) =>
      this.#compareText(left.subpath, right.subpath),
    );
    return Object.freeze(exports);
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text value.
   * @param right - Second text value.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
