import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import type { IExistingGeneratedFile } from "../contracts/internal/existing-generated-file.contract.js";
import type { IGeneratedPackageMetadata } from "../contracts/internal/generated-package-metadata.contract.js";
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
   * @description Accepted canonical semantic-version grammar.
   */
  readonly #packageVersionPattern =
    /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-(?:(?:0|[1-9][0-9]*)|(?:[A-Za-z-][0-9A-Za-z-]*))(?:\.(?:(?:0|[1-9][0-9]*)|(?:[A-Za-z-][0-9A-Za-z-]*)))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;

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
        "package",
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
    const packageMetadata = this.#normalisePackageMetadata(
      record.package,
      `${path}.package`,
    );
    const entries = this.#validator
      .array(record.entries, `${path}.entries`)
      .map((entry, index) =>
        this.#normaliseEntry(
          entry,
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
      package: packageMetadata,
      entries: Object.freeze(entries),
      existingFiles: Object.freeze(existingFiles),
    });
  }

  /**
   * @description Validates and isolates generated package publication metadata.
   * @param value - Unknown generated package metadata.
   * @param path - Logical package metadata path.
   * @returns Frozen canonical generated package metadata.
   */
  #normalisePackageMetadata(
    value: unknown,
    path: string,
  ): IGeneratedPackageMetadata {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["name", "version", "description", "licence"],
      path,
    );
    const name = this.#normalisePackageName(record.name, `${path}.name`);
    const version = this.#validator.nonEmptyString(
      record.version,
      `${path}.version`,
    );

    if (!this.#packageVersionPattern.test(version)) {
      throw new BuildContractError(
        `${path}.version`,
        "expected a canonical semantic version",
      );
    }

    const description = this.#normaliseCanonicalText(
      record.description,
      `${path}.description`,
    );
    const licence = this.#normaliseCanonicalText(
      record.licence,
      `${path}.licence`,
    );

    return Object.freeze({ name, version, description, licence });
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
   * @param path - Logical entry path.
   * @returns Frozen accepted entry.
   */
  #normaliseEntry(
    value: unknown,
    path: string,
  ): IGenerationEntry {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["sourceIds", "definition"], path);
    const sourceIds = this.#validator
      .array(record.sourceIds, `${path}.sourceIds`)
      .map((sourceId, index) =>
        this.#sourceIdNormaliser.normalise(
          sourceId,
          `${path}.sourceIds[${index}]`,
        ),
      )
      .sort((left, right) => this.#compareText(left, right));

    if (sourceIds.length === 0) {
      throw new BuildContractError(
        `${path}.sourceIds`,
        "expected at least one canonical source identifier",
      );
    }

    if (new Set(sourceIds).size !== sourceIds.length) {
      throw new BuildContractError(
        `${path}.sourceIds`,
        "expected unique canonical source identifiers",
      );
    }

    const definition = Icon.define(record.definition as IconDefinition);

    return Object.freeze({
      sourceIds: Object.freeze(sourceIds) as readonly [
        string,
        ...string[],
      ],
      definition,
    });
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

  /**
   * @description Accepts trimmed non-empty metadata text without modification.
   * @param value - Unknown textual metadata.
   * @param path - Logical metadata path.
   * @returns Canonical accepted text.
   */
  #normaliseCanonicalText(value: unknown, path: string): string {
    const accepted = this.#validator.nonEmptyString(value, path);

    if (accepted !== accepted.trim()) {
      throw new BuildContractError(path, "expected canonical trimmed text");
    }

    return accepted;
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
