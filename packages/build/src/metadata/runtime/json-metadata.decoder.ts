import type {
  CollectionPresentationPolicy,
  IconIdentity,
  IconPresentation,
  IconPresentationOverrideType,
  IconRtlPolicyType,
} from "@aster/core";
import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import type { IIconMetadataValue } from "../../normalisation/contracts/internal/icon-metadata-value.contract.js";
import type {
  CollectionMetadataSource,
  IconMetadataSource,
} from "../../source/contracts/index.js";
import type { IDecodedCollectionMetadata } from "../contracts/internal/decoded-collection-metadata.contract.js";
import type { IMetadataDecoder } from "../contracts/internal/metadata-decoder.contract.js";
import type { TMetadataIssue } from "../types/internal/metadata-issue.type.js";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { BuildValueValidator } from "../../shared/runtime/build-value.validator.js";
import { svgPresentationAttributeSchema } from "../../shared/constants/svg-presentation-attribute-schema.constant.js";
import { SourceIdentityNormaliser } from "../../source/runtime/source-identity.normaliser.js";
import { metadataIssueKinds } from "../constants/metadata-issue-kinds.constant.js";
import { metadataSchema } from "../constants/metadata-schema.constant.js";
import { JsonSyntaxInspector } from "./json-syntax.inspector.js";
import { MetadataDecodeError } from "./metadata-decode.error.js";
import { MetadataDiagnosticFactory } from "./metadata-diagnostic.factory.js";

/**
 * @description Decodes closed version-one collection and icon JSON metadata.
 */
export class JsonMetadataDecoder implements IMetadataDecoder {
  /**
   * @description Strict JSON syntax and resource inspection authority.
   */
  readonly #syntaxInspector = new JsonSyntaxInspector();

  /**
   * @description Primitive build-value validation authority.
   */
  readonly #validator = new BuildValueValidator();

  /**
   * @description Canonical icon identity normalisation authority.
   */
  readonly #identityNormaliser = new SourceIdentityNormaliser();

  /**
   * @description Stable metadata diagnostic construction authority.
   */
  readonly #diagnosticFactory = new MetadataDiagnosticFactory();

  /**
   * @description Diagnostic-bearing result construction authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Decodes one collection metadata source.
   * @param source - Canonical collection metadata source.
   * @returns Accepted immutable collection metadata or blocking source diagnostics.
   */
  decodeCollection(
    source: CollectionMetadataSource,
  ): DiagnosticResultType<IDecodedCollectionMetadata> {
    return this.#decode(source, (value) => {
      const path = "collectionMetadata";
      const record = this.#record(value, path);
      this.#exactFields(record, metadataSchema.collectionFields, path);
      this.#version(record.schemaVersion, `${path}.schemaVersion`);
      const collection = this.#identityNormaliser.normaliseCollection(
        record.slug,
        `${path}.slug`,
      );

      if (collection !== source.collection) {
        throw new MetadataDecodeError(
          metadataIssueKinds.identityDisagreement,
          "slug",
        );
      }

      const packageValue = this.#record(record.package, `${path}.package`);
      this.#exactFields(
        packageValue,
        metadataSchema.packageFields,
        `${path}.package`,
      );
      const presentation = this.#presentation(record, path);
      const validation = this.#deepFreezeRecord(
        this.#record(record.validation, `${path}.validation`),
      );
      this.#text(record.name, `${path}.name`);
      this.#closedString(
        record.status,
        metadataSchema.statuses,
        `${path}.status`,
      );

      return Object.freeze({
        sourceId: source.sourceId,
        collection,
        packageName: this.#text(
          packageValue.name,
          `${path}.package.name`,
        ),
        packageVersion: this.#text(
          packageValue.version,
          `${path}.package.version`,
        ),
        description: this.#text(record.description, `${path}.description`),
        licence: this.#text(record.licence, `${path}.licence`),
        attribution: this.#text(record.attribution, `${path}.attribution`),
        allowIconLicenceOverride: this.#boolean(
          record.allowIconLicenceOverride,
          `${path}.allowIconLicenceOverride`,
        ),
        presentation,
        validation,
      });
    });
  }

  /**
   * @description Decodes one icon metadata source.
   * @param source - Canonical icon metadata source.
   * @returns Accepted immutable icon metadata or blocking source diagnostics.
   */
  decodeIcon(
    source: IconMetadataSource,
  ): DiagnosticResultType<IIconMetadataValue> {
    return this.#decode(source, (value) => {
      const path = "iconMetadata";
      const record = this.#record(value, path);
      this.#exactFields(record, metadataSchema.iconFields, path);
      this.#version(record.schemaVersion, `${path}.schemaVersion`);
      const identity = this.#identityNormaliser.normalise(
        {
          collection: source.identity.collection,
          name: record.name,
          ...("variant" in record ? { variant: record.variant } : {}),
        },
        `${path}.identity`,
      );
      const { name, variant } = identity;

      if (name !== source.identity.name) {
        throw new MetadataDecodeError(
          metadataIssueKinds.identityDisagreement,
          "name",
        );
      }

      if (variant !== source.identity.variant) {
        throw new MetadataDecodeError(
          metadataIssueKinds.identityDisagreement,
          "variant",
        );
      }

      const rtl =
        "rtl" in record
          ? this.#closedString(
              record.rtl,
              metadataSchema.rtlPolicies,
              `${path}.rtl`,
            )
          : undefined;
      const replacedBy =
        "replacedBy" in record
          ? this.#identity(record.replacedBy, `${path}.replacedBy`)
          : undefined;

      return Object.freeze({
        sourceId: source.sourceId,
        identity: source.identity,
        displayName: this.#text(
          record.displayName,
          `${path}.displayName`,
        ),
        ...(rtl === undefined ? {} : { rtl: rtl as IconRtlPolicyType }),
        ...this.#optionalText(record, "licence", path),
        ...this.#optionalText(record, "attribution", path),
        ...("deprecated" in record
          ? {
              deprecated: this.#boolean(
                record.deprecated,
                `${path}.deprecated`,
              ),
            }
          : {}),
        ...(replacedBy === undefined ? {} : { replacedBy }),
      });
    });
  }

  /**
   * @description Inspects and semantically decodes one metadata source.
   * @typeParam Value - Accepted semantic metadata value.
   * @param source - Canonical textual metadata source.
   * @param decode - Semantic decoder for the expected metadata role.
   * @returns Accepted immutable value or one blocking metadata diagnostic.
   */
  #decode<Value>(
    source: CollectionMetadataSource | IconMetadataSource,
    decode: (value: unknown) => Value,
  ): DiagnosticResultType<Value> {
    const inspection = this.#syntaxInspector.inspect(source.content);

    if (!inspection.accepted) {
      const issue: TMetadataIssue =
        "duplicateKey" in inspection
          ? {
              kind: metadataIssueKinds.duplicateKey,
              source,
              subject: inspection.duplicateKey,
              startOffset: inspection.startOffset,
              endOffset: inspection.endOffset,
            }
          : {
              kind: metadataIssueKinds.malformedJson,
              source,
              reason: inspection.reason,
            };

      return this.#resultFactory.failure([
        this.#diagnosticFactory.create(issue),
      ]);
    }

    try {
      return this.#resultFactory.success(decode(inspection.value));
    } catch (error) {
      if (error instanceof MetadataDecodeError) {
        return this.#resultFactory.failure([
          this.#diagnosticFactory.create({
            kind: error.kind,
            source,
            subject: error.subject,
          }),
        ]);
      }

      if (error instanceof BuildContractError) {
        return this.#resultFactory.failure([
          this.#diagnosticFactory.create({
            kind: metadataIssueKinds.invalidValue,
            source,
            subject: error.path,
          }),
        ]);
      }

      throw error;
    }
  }

  /**
   * @description Accepts one closed version-one metadata schema discriminator.
   * @param value - Unknown schema version.
   * @param path - Logical schema-version path.
   * @returns Nothing.
   */
  #version(value: unknown, path: string): void {
    if (value !== metadataSchema.schemaVersion) {
      throw new MetadataDecodeError(
        metadataIssueKinds.unsupportedVersion,
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : path,
      );
    }
  }

  /**
   * @description Accepts one plain metadata object.
   * @param value - Unknown metadata value.
   * @param path - Logical metadata path.
   * @returns Accepted object record.
   */
  #record(value: unknown, path: string): Record<string, unknown> {
    return this.#validator.record(value, path);
  }

  /**
   * @description Rejects fields outside one closed metadata object vocabulary.
   * @param value - Metadata object record.
   * @param accepted - Closed accepted field sequence.
   * @param path - Logical object path.
   * @returns Nothing.
   */
  #exactFields(
    value: Record<string, unknown>,
    accepted: readonly string[],
    path: string,
  ): void {
    const unsupported = Object.keys(value).find(
      (field) => !accepted.includes(field),
    );

    if (unsupported !== undefined) {
      throw new MetadataDecodeError(
        metadataIssueKinds.unknownField,
        `${path}.${unsupported}`,
      );
    }
  }

  /**
   * @description Accepts one trimmed non-empty metadata text value.
   * @param value - Unknown metadata text.
   * @param path - Logical metadata path.
   * @returns Accepted unchanged text.
   */
  #text(value: unknown, path: string): string {
    const text = this.#validator.nonEmptyString(value, path);

    if (text !== text.trim()) {
      throw new BuildContractError(path, "expected trimmed text");
    }

    return text;
  }

  /**
   * @description Accepts one exact boolean metadata value.
   * @param value - Unknown metadata value.
   * @param path - Logical metadata path.
   * @returns Accepted boolean.
   */
  #boolean(value: unknown, path: string): boolean {
    if (typeof value !== "boolean") {
      throw new BuildContractError(path, "expected a boolean");
    }

    return value;
  }

  /**
   * @description Accepts one string from a closed metadata vocabulary.
   * @param value - Unknown metadata value.
   * @param accepted - Closed accepted string sequence.
   * @param path - Logical metadata path.
   * @returns Accepted string.
   */
  #closedString(
    value: unknown,
    accepted: readonly string[],
    path: string,
  ): string {
    if (typeof value !== "string" || !accepted.includes(value)) {
      throw new BuildContractError(
        path,
        `expected one of ${accepted.join(", ")}`,
      );
    }

    return value;
  }

  /**
   * @description Resolves collection presentation defaults and override authority.
   * @param record - Complete collection metadata record.
   * @param path - Logical collection metadata path.
   * @returns Deeply frozen portable collection presentation policy.
   */
  #presentation(
    record: Record<string, unknown>,
    path: string,
  ): CollectionPresentationPolicy {
    const presentationFields = Object.freeze(
      Object.values(svgPresentationAttributeSchema).map(
        (schema) => schema.field,
      ),
    );
    const defaultsRecord = this.#record(
      record.presentationDefaults,
      `${path}.presentationDefaults`,
    );
    this.#exactFields(
      defaultsRecord,
      presentationFields,
      `${path}.presentationDefaults`,
    );
    const defaults = Object.freeze({
      ...defaultsRecord,
    }) as IconPresentation;
    const overrideValues = this.#validator.array(
      record.presentationOverrides,
      `${path}.presentationOverrides`,
    );
    const overrides = overrideValues.map((value, index) =>
      this.#closedString(
        value,
        presentationFields,
        `${path}.presentationOverrides[${index}]`,
      ),
    ) as IconPresentationOverrideType[];

    if (new Set(overrides).size !== overrides.length) {
      throw new BuildContractError(
        `${path}.presentationOverrides`,
        "expected duplicate-free fields",
      );
    }

    return Object.freeze({
      defaults,
      overrides: Object.freeze(overrides),
      defaultSize: this.#validator.positiveNumber(
        record.defaultSize,
        `${path}.defaultSize`,
      ),
      minimumSize: this.#validator.positiveNumber(
        record.minimumSize,
        `${path}.minimumSize`,
      ),
    });
  }

  /**
   * @description Resolves one optional trimmed metadata text field.
   * @param record - Metadata record.
   * @param field - Optional field name.
   * @param path - Logical record path.
   * @returns Empty object or one accepted named text property.
   */
  #optionalText(
    record: Record<string, unknown>,
    field: "licence" | "attribution",
    path: string,
  ): Readonly<Record<string, string>> {
    return field in record
      ? { [field]: this.#text(record[field], `${path}.${field}`) }
      : {};
  }

  /**
   * @description Resolves one fully qualified replacement identity.
   * @param value - Unknown identity value.
   * @param path - Logical identity path.
   * @returns Canonical immutable icon identity.
   */
  #identity(value: unknown, path: string): IconIdentity {
    const record = this.#record(value, path);
    this.#exactFields(record, metadataSchema.identityFields, path);
    return this.#identityNormaliser.normalise(record, path);
  }

  /**
   * @description Deeply freezes one JSON-derived object graph.
   * @param value - JSON-derived object record.
   * @returns Deeply frozen object record.
   */
  #deepFreezeRecord(
    value: Record<string, unknown>,
  ): Readonly<Record<string, unknown>> {
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested)) {
        for (const entry of nested) {
          if (typeof entry === "object" && entry !== null) {
            this.#deepFreezeRecord(entry as Record<string, unknown>);
          }
        }

        Object.freeze(nested);
      } else if (typeof nested === "object" && nested !== null) {
        this.#deepFreezeRecord(nested as Record<string, unknown>);
      }
    }

    return Object.freeze(value);
  }
}
