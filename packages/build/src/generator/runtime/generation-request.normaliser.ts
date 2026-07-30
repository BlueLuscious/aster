import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import type { IExistingGeneratedFile } from "../contracts/internal/existing-generated-file.contract.js";
import type { IGenerationEntry } from "../contracts/internal/generation-entry.contract.js";
import type { IGenerationRequest } from "../contracts/internal/generation-request.contract.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { BuildValueValidator } from "../../shared/runtime/build-value.validator.js";
import { SourceIdNormaliser } from "../../source/runtime/source-id.normaliser.js";
import { SourceIdentityNormaliser } from "../../source/runtime/source-identity.normaliser.js";

/**
 * @description Validates, isolates, and freezes pure generation-planning requests.
 */
export class GenerationRequestNormaliser {
  /**
   * @description Primitive build-value validator.
   */
  readonly #validator = new BuildValueValidator();

  /**
   * @description Canonical logical path authority.
   */
  readonly #sourceIdNormaliser = new SourceIdNormaliser();

  /**
   * @description Canonical collection identity authority.
   */
  readonly #identityNormaliser = new SourceIdentityNormaliser();

  /**
   * @description Accepted npm package-name grammar.
   */
  readonly #packageNamePattern =
    /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u;

  /**
   * @description Produces one accepted immutable generation request.
   * @param value - Unknown generation-planning input.
   * @returns Deeply isolated request with Core-revalidated definitions.
   */
  normalise(value: unknown): IGenerationRequest {
    const path = "generationRequest";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      [
        "collectionSourceId",
        "collection",
        "packageName",
        "entries",
        "existingFiles",
      ],
      path,
    );
    const collectionSourceId = this.#sourceIdNormaliser.normalise(
      record.collectionSourceId,
      `${path}.collectionSourceId`,
    );
    const collection = this.#identityNormaliser.normaliseCollection(
      record.collection,
      `${path}.collection`,
    );
    const packageName = this.#normalisePackageName(
      record.packageName,
      `${path}.packageName`,
    );
    const entries = this.#validator
      .array(record.entries, `${path}.entries`)
      .map((entry, index) =>
        this.#normaliseEntry(
          entry,
          collection,
          `${path}.entries[${index}]`,
        ),
      );

    if (entries.length === 0) {
      throw new BuildContractError(
        `${path}.entries`,
        "expected at least one generation entry",
      );
    }

    const existingFiles =
      "existingFiles" in record
        ? this.#validator
            .array(record.existingFiles, `${path}.existingFiles`)
            .map((file, index) =>
              this.#normaliseExistingFile(
                file,
                `${path}.existingFiles[${index}]`,
              ),
            )
        : [];
    const duplicateExistingPath = existingFiles.find(
      (file, index) =>
        existingFiles.findIndex((candidate) => candidate.path === file.path) !==
        index,
    );

    if (duplicateExistingPath !== undefined) {
      throw new BuildContractError(
        `${path}.existingFiles`,
        `duplicate path ${duplicateExistingPath.path}`,
      );
    }

    return Object.freeze({
      collectionSourceId,
      collection,
      packageName,
      entries: Object.freeze(entries),
      existingFiles: Object.freeze(existingFiles),
    });
  }

  /**
   * @description Validates one canonical npm package name.
   * @param value - Unknown intended package name.
   * @param path - Logical package-name path.
   * @returns Accepted package name without modification.
   */
  #normalisePackageName(value: unknown, path: string): string {
    if (
      typeof value !== "string" ||
      !this.#packageNamePattern.test(value)
    ) {
      throw new BuildContractError(path, "expected a canonical npm package name");
    }

    return value;
  }

  /**
   * @description Validates one generation entry and re-establishes Core authority.
   * @param value - Unknown generation entry.
   * @param collection - Canonical collection owning the request.
   * @param path - Logical entry path.
   * @returns Frozen accepted entry.
   */
  #normaliseEntry(
    value: unknown,
    collection: string,
    path: string,
  ): IGenerationEntry {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["sourceId", "definition"], path);
    const sourceId = this.#sourceIdNormaliser.normalise(
      record.sourceId,
      `${path}.sourceId`,
    );
    const definition = Icon.define(record.definition as IconDefinition);

    if (definition.identity.collection !== collection) {
      throw new BuildContractError(
        `${path}.definition.identity.collection`,
        "expected the request collection",
      );
    }

    return Object.freeze({ sourceId, definition });
  }

  /**
   * @description Validates one existing generated-root-relative text file.
   * @param value - Unknown existing file snapshot.
   * @param path - Logical existing-file path.
   * @returns Frozen accepted existing file.
   */
  #normaliseExistingFile(
    value: unknown,
    path: string,
  ): IExistingGeneratedFile {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["path", "content"], path);
    const filePath = this.#sourceIdNormaliser.normalise(
      record.path,
      `${path}.path`,
    );

    if (typeof record.content !== "string") {
      throw new BuildContractError(`${path}.content`, "expected text");
    }

    return Object.freeze({ path: filePath, content: record.content });
  }
}
