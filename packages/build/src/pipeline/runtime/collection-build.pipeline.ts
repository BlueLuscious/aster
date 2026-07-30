import type { IconDefinition } from "@aster/core";
import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import type { ISvgSyntaxDocument } from "../../parser/contracts/internal/svg-syntax-document.contract.js";
import type { IIconMetadataValue } from "../../normalisation/contracts/internal/icon-metadata-value.contract.js";
import type { IconMetadataSource } from "../../source/contracts/index.js";
import type {
  CollectionBuildEntry,
  CollectionBuildOutput,
  CollectionBuildRequest,
} from "../contracts/index.js";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { GenerationPlanner } from "../../generator/runtime/generation.planner.js";
import { JsonMetadataDecoder } from "../../metadata/runtime/json-metadata.decoder.js";
import { MetadataDiagnosticFactory } from "../../metadata/runtime/metadata-diagnostic.factory.js";
import { SvgNormaliser } from "../../normalisation/runtime/svg.normaliser.js";
import { SvgParser } from "../../parser/runtime/svg.parser.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { metadataIssueKinds } from "../../metadata/constants/metadata-issue-kinds.constant.js";
import { SvgValidator } from "../../validation/runtime/svg.validator.js";

/**
 * @description Composes the pure acquired SVG import source-to-package build pipeline.
 * @remarks Filesystem discovery, writes, compilation, and process exit authority remain with the
 * effectful host. This service returns a complete output only after every blocking stage succeeds.
 */
export class CollectionBuildPipeline {
  /**
   * @description Versioned JSON metadata decoding authority.
   */
  readonly #metadataDecoder = new JsonMetadataDecoder();

  /**
   * @description Safe SVG syntax parsing authority.
   */
  readonly #parser = new SvgParser();

  /**
   * @description Technical and collection-owned validation authority.
   */
  readonly #validator = new SvgValidator();

  /**
   * @description Portable icon definition normalisation authority.
   */
  readonly #normaliser = new SvgNormaliser();

  /**
   * @description Deterministic generated package planning authority.
   */
  readonly #planner = new GenerationPlanner();

  /**
   * @description Stable metadata diagnostic construction authority.
   */
  readonly #metadataDiagnosticFactory = new MetadataDiagnosticFactory();

  /**
   * @description Diagnostic-bearing result construction authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Builds one acquired collection without performing host effects.
   * @param request - Selected acquired import sources and existing text snapshot.
   * @returns Complete generated package output with warnings, or blocking diagnostics without output.
   */
  build(
    request: CollectionBuildRequest,
  ): DiagnosticResultType<CollectionBuildOutput> {
    const diagnostics: SourceDiagnostic[] = [];
    const collectionResult = this.#metadataDecoder.decodeCollection(
      request.collectionMetadata,
    );

    diagnostics.push(...collectionResult.diagnostics);
    const parsedEntries: Array<{
      readonly entry: CollectionBuildEntry;
      readonly document: ISvgSyntaxDocument;
      readonly metadata: IIconMetadataValue;
    }> = [];

    for (const entry of request.entries) {
      const metadataResult = this.#metadataDecoder.decodeIcon(entry.metadata);
      const parserResult = this.#parser.parse(entry.svg);
      diagnostics.push(
        ...metadataResult.diagnostics,
        ...parserResult.diagnostics,
      );

      if (metadataResult.successful && parserResult.successful) {
        parsedEntries.push({
          entry,
          document: parserResult.value,
          metadata: metadataResult.value,
        });
      }
    }

    if (
      !collectionResult.successful ||
      parsedEntries.length !== request.entries.length
    ) {
      return this.#resultFactory.failure(diagnostics);
    }

    const collectionMetadata = collectionResult.value;
    let validationResult: ReturnType<SvgValidator["validate"]>;

    try {
      validationResult = this.#validator.validate({
        collectionMetadata: request.collectionMetadata,
        entries: parsedEntries.map(({ entry, document }) =>
          Object.freeze({
            source: entry.svg,
            document,
          }),
        ),
        iconMetadata: parsedEntries.map(({ entry }) => entry.metadata),
        collectionContract: {
          collection: collectionMetadata.collection,
          ...collectionMetadata.validation,
        },
      });
    } catch (error) {
      if (!(error instanceof BuildContractError)) {
        throw error;
      }

      diagnostics.push(
        this.#metadataDiagnosticFactory.create({
          kind: metadataIssueKinds.invalidValue,
          source: request.collectionMetadata,
          subject: error.path,
        }),
      );
      return this.#resultFactory.failure(diagnostics);
    }

    diagnostics.push(...validationResult.diagnostics);

    if (!validationResult.successful) {
      return this.#resultFactory.failure(diagnostics);
    }

    let definitions: readonly IconDefinition[];

    try {
      definitions = this.#normaliser.normalise({
        evidence: validationResult.value,
        collectionMetadata,
        iconMetadata: parsedEntries.map(({ metadata }) => metadata),
      });
    } catch (error) {
      if (
        !(error instanceof BuildContractError) &&
        !(
          error instanceof TypeError &&
          error.name === "IconDefinitionError"
        )
      ) {
        throw error;
      }

      diagnostics.push(
        this.#metadataDiagnosticFactory.create({
          kind: metadataIssueKinds.invalidValue,
          source: request.collectionMetadata,
          subject:
            error instanceof BuildContractError
              ? error.path
              : "collectionMetadata.presentationDefaults",
        }),
      );
      return this.#resultFactory.failure(diagnostics);
    }
    let generationResult: ReturnType<GenerationPlanner["plan"]>;

    try {
      generationResult = this.#planner.plan({
        collectionSourceId: collectionMetadata.sourceId,
        collection: collectionMetadata.collection,
        package: {
          name: collectionMetadata.packageName,
          version: collectionMetadata.packageVersion,
          description: collectionMetadata.description,
          licence: collectionMetadata.licence,
        },
        entries: this.#generationEntries(
          definitions,
          validationResult.value.entries.map((entry) => entry.metadata),
          validationResult.value.entries.map(
            (entry) => entry.source.sourceId,
          ),
        ),
        ...(request.existingFiles === undefined
          ? {}
          : { existingFiles: request.existingFiles }),
      });
    } catch (error) {
      if (!(error instanceof BuildContractError)) {
        throw error;
      }

      diagnostics.push(
        this.#metadataDiagnosticFactory.create({
          kind: metadataIssueKinds.invalidValue,
          source: request.collectionMetadata,
          subject: error.path,
        }),
      );
      return this.#resultFactory.failure(diagnostics);
    }

    diagnostics.push(...generationResult.diagnostics);

    if (!generationResult.successful) {
      return this.#resultFactory.failure(diagnostics);
    }

    return this.#resultFactory.success(
      Object.freeze({
        collection: generationResult.value.collection,
        packageName: generationResult.value.package.name,
        files: Object.freeze(
          generationResult.value.files.map((file) =>
            Object.freeze({
              path: file.path,
              content: file.content,
            }),
          ),
        ),
        stalePaths: generationResult.value.stalePaths,
      }),
      diagnostics,
    );
  }

  /**
   * @description Links ordered definitions to their independently acquired source provenance.
   * @param definitions - Canonically ordered portable icon definitions.
   * @param metadataSources - Correspondingly ordered icon metadata sources.
   * @param svgSourceIds - Correspondingly ordered SVG source identifiers.
   * @returns Frozen deterministic generation entries.
   */
  #generationEntries(
    definitions: readonly IconDefinition[],
    metadataSources: readonly IconMetadataSource[],
    svgSourceIds: readonly string[],
  ): readonly {
    readonly definition: IconDefinition;
    readonly sourceIds: readonly [string, string];
  }[] {
    if (
      definitions.length !== metadataSources.length ||
      definitions.length !== svgSourceIds.length
    ) {
      throw new BuildContractError(
        "pipeline.definitions",
        "normalised definitions require complete ordered provenance",
      );
    }

    return Object.freeze(
      definitions.map((definition, index) =>
        Object.freeze({
          definition,
          sourceIds: Object.freeze([
            metadataSources[index]?.sourceId ?? "",
            svgSourceIds[index] ?? "",
          ]) as readonly [string, string],
        }),
      ),
    );
  }
}
