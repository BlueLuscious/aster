import {
  iconRtlPolicies,
  type CollectionMetadata,
  type IconIdentity,
  type IconRtlPolicyType,
} from "@aster/core";
import { CanonicalIdentityValidator } from "../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { catalogueDiscoverySchema } from "../constants/catalogue-discovery-schema.constant.js";
import type { CatalogueIconMetadata } from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueDiscoveryIdentityNormaliser } from "./catalogue-discovery-identity.normaliser.js";

/**
 * @description Accepts and isolates lightweight icon and collection discovery metadata.
 */
export class CatalogueDiscoveryMetadataNormaliser {
  /** @description Exact plain-data inspection authority. */
  readonly #data = new StructuredDataInspector();

  /** @description Canonical intrinsic-tag grammar authority. */
  readonly #slugs = new CanonicalIdentityValidator();

  /** @description Portable replacement-identity acceptance authority. */
  readonly #identities = new CatalogueDiscoveryIdentityNormaliser();

  /** @description Canonical identity formatter used for self-replacement checks. */
  readonly #identityFormat = new CatalogueIdentityFormatter();

  /**
   * @description Accepts lightweight metadata for one known icon identity.
   * @param value - Candidate metadata record.
   * @param identity - Accepted owning icon identity.
   * @returns Frozen canonical metadata or no value after rejection.
   */
  icon(
    value: unknown,
    identity: IconIdentity,
  ): CatalogueIconMetadata | undefined {
    const record = this.#data.record(
      value,
      catalogueDiscoverySchema.iconMetadataFields,
      catalogueDiscoverySchema.requiredIconMetadataFields,
    );
    const displayName = record === undefined
      ? undefined
      : this.#text(record.displayName);
    const tags = record === undefined
      ? null
      : this.#optionalTags(record, "tags");
    const licence = record === undefined
      ? null
      : this.#optionalText(record, "licence");
    const attribution = record === undefined
      ? null
      : this.#optionalText(record, "attribution");
    const replacedBy = record === undefined || !Object.hasOwn(record, "replacedBy")
      ? undefined
      : this.#identities.icon(record.replacedBy);

    if (
      record === undefined
      || displayName === undefined
      || tags === null
      || licence === null
      || attribution === null
      || typeof record.rtl !== "string"
      || !iconRtlPolicies.includes(record.rtl as IconRtlPolicyType)
      || typeof record.deprecated !== "boolean"
      || (Object.hasOwn(record, "replacedBy") && replacedBy === undefined)
      || (attribution !== undefined && licence === undefined)
      || (replacedBy !== undefined && !record.deprecated)
      || (
        replacedBy !== undefined
        && this.#identityFormat.icon(replacedBy) === this.#identityFormat.icon(identity)
      )
    ) {
      return undefined;
    }

    return Object.freeze({
      displayName,
      ...(tags === undefined ? {} : { tags }),
      rtl: record.rtl as IconRtlPolicyType,
      ...(licence === undefined ? {} : { licence }),
      ...(attribution === undefined ? {} : { attribution }),
      deprecated: record.deprecated,
      ...(replacedBy === undefined ? {} : { replacedBy }),
    });
  }

  /**
   * @description Accepts descriptive collection metadata.
   * @param value - Candidate metadata record.
   * @returns Frozen canonical metadata or no value after rejection.
   */
  collection(value: unknown): CollectionMetadata | undefined {
    const record = this.#data.record(
      value,
      catalogueDiscoverySchema.collectionMetadataFields,
      catalogueDiscoverySchema.requiredCollectionMetadataFields,
    );
    const displayName = record === undefined
      ? undefined
      : this.#text(record.displayName);
    const description = record === undefined
      ? null
      : this.#optionalText(record, "description");
    const tags = record === undefined
      ? null
      : this.#optionalTags(record, "tags");
    const licence = record === undefined
      ? null
      : this.#optionalText(record, "licence");
    const attribution = record === undefined
      ? null
      : this.#optionalText(record, "attribution");

    if (
      record === undefined
      || displayName === undefined
      || description === null
      || tags === null
      || licence === null
      || attribution === null
      || (attribution !== undefined && licence === undefined)
    ) {
      return undefined;
    }

    return Object.freeze({
      displayName,
      ...(description === undefined ? {} : { description }),
      ...(tags === undefined ? {} : { tags }),
      ...(licence === undefined ? {} : { licence }),
      ...(attribution === undefined ? {} : { attribution }),
    });
  }

  /**
   * @description Accepts one optional canonical tag sequence.
   * @param record - Snapshotted owning metadata record.
   * @param key - Optional tag field name.
   * @returns Frozen tags, no value when absent, or null after rejection.
   */
  #optionalTags(
    record: Readonly<Record<string, unknown>>,
    key: string,
  ): readonly string[] | undefined | null {
    if (!Object.hasOwn(record, key)) {
      return undefined;
    }

    const values = this.#data.array(record[key]);

    if (values === undefined) {
      return null;
    }

    const tags = values.filter((value): value is string =>
      this.#slugs.slug(value),
    );

    if (tags.length !== values.length || new Set(tags).size !== tags.length) {
      return null;
    }

    return Object.freeze(tags);
  }

  /**
   * @description Accepts one optional trimmed non-empty text field.
   * @param record - Snapshotted owning metadata record.
   * @param key - Optional text field name.
   * @returns Canonical text, no value when absent, or null after rejection.
   */
  #optionalText(
    record: Readonly<Record<string, unknown>>,
    key: string,
  ): string | undefined | null {
    return Object.hasOwn(record, key) ? this.#text(record[key]) ?? null : undefined;
  }

  /**
   * @description Trims one non-empty text candidate.
   * @param value - Candidate text.
   * @returns Canonical text or no value after rejection.
   */
  #text(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined;
  }
}
