import type { CollectionIdentity } from "@aster/core";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { catalogueDiscoverySchema } from "../constants/catalogue-discovery-schema.constant.js";
import type {
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
} from "../contracts/index.js";
import { CatalogueDiscoveryIdentityNormaliser } from "./catalogue-discovery-identity.normaliser.js";
import { CatalogueDiscoveryMetadataNormaliser } from "./catalogue-discovery-metadata.normaliser.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Accepts and isolates individual provider-owned discovery records.
 */
export class CatalogueDiscoveryRecordNormaliser {
  /** @description Locale-independent membership ordering authority. */
  readonly #ascii = new AsciiStringComparator();

  /** @description Exact provider-record and dense-array inspection authority. */
  readonly #data = new StructuredDataInspector();

  /** @description Portable identity acceptance authority. */
  readonly #identityNormaliser = new CatalogueDiscoveryIdentityNormaliser();

  /** @description Lightweight metadata acceptance authority. */
  readonly #metadataNormaliser = new CatalogueDiscoveryMetadataNormaliser();

  /** @description Canonical portable identity formatter. */
  readonly #identities = new CatalogueIdentityFormatter();

  /** @description Immutable diagnostic constructor for rejected records. */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Accepts one provider-owned collection discovery record.
   * @param providerIdentity - Canonical identity of the supplying provider.
   * @param value - Candidate collection discovery record.
   * @returns Accepted isolated record or structured provider rejection.
   */
  collection(
    providerIdentity: string,
    value: unknown,
  ): TAcceptanceResult<CatalogueDiscoveryCollectionRecord> {
    const record = this.#data.record(
      value,
      catalogueDiscoverySchema.collectionFields,
      catalogueDiscoverySchema.requiredCollectionFields,
    );
    const iconValues = record === undefined
      ? undefined
      : this.#data.array(record.icons);
    const identity = record === undefined
      ? undefined
      : this.#identityNormaliser.collection(record.identity);
    const metadata = record === undefined
      ? undefined
      : this.#metadataNormaliser.collection(record.metadata);
    const searchTerms = record === undefined
      ? null
      : this.#searchTerms(record);

    if (
      record === undefined
      || iconValues === undefined
      || identity === undefined
      || metadata === undefined
      || searchTerms === null
    ) {
      return this.#unavailable(
        providerIdentity,
        "collection discovery record contains an invalid value",
      );
    }

    const icons = iconValues.map((candidate) =>
      this.#identityNormaliser.icon(candidate),
    );

    if (icons.some((icon) => icon === undefined)) {
      return this.#unavailable(
        providerIdentity,
        "collection discovery record contains an invalid icon identity",
      );
    }

    const acceptedIcons = icons.filter((icon) => icon !== undefined);
    const iconKeys = acceptedIcons.map((icon) => this.#identities.icon(icon));

    if (new Set(iconKeys).size !== iconKeys.length) {
      return this.#conflict(
        providerIdentity,
        "collection discovery members must be unique",
      );
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        identity,
        metadata,
        icons: Object.freeze(acceptedIcons),
        ...(searchTerms === undefined ? {} : { searchTerms }),
      }),
    });
  }

  /**
   * @description Accepts one provider-owned icon discovery record.
   * @param providerIdentity - Canonical identity of the supplying provider.
   * @param value - Candidate icon discovery record.
   * @param collectionsByIdentity - Accepted collections available to membership resolution.
   * @returns Accepted isolated record or structured provider rejection.
   */
  icon(
    providerIdentity: string,
    value: unknown,
    collectionsByIdentity: ReadonlyMap<string, CatalogueDiscoveryCollectionRecord>,
  ): TAcceptanceResult<CatalogueDiscoveryIconRecord> {
    const record = this.#data.record(
      value,
      catalogueDiscoverySchema.iconFields,
      catalogueDiscoverySchema.requiredIconFields,
    );
    const membershipValues = record === undefined
      ? undefined
      : this.#data.array(record.memberships);
    const identity = record === undefined
      ? undefined
      : this.#identityNormaliser.icon(record.identity);
    const metadata = record === undefined || identity === undefined
      ? undefined
      : this.#metadataNormaliser.icon(record.metadata, identity);
    const searchTerms = record === undefined
      ? null
      : this.#searchTerms(record);

    if (
      record === undefined
      || membershipValues === undefined
      || identity === undefined
      || metadata === undefined
      || searchTerms === null
    ) {
      return this.#unavailable(
        providerIdentity,
        "icon discovery record contains an invalid value",
      );
    }

    const memberships: CollectionIdentity[] = [];
    const membershipKeys: string[] = [];

    for (const candidate of membershipValues) {
      const acceptedIdentity = this.#identityNormaliser.collection(candidate);
      const key = acceptedIdentity === undefined
        ? undefined
        : this.#identities.collection(acceptedIdentity);
      const collection = key === undefined
        ? undefined
        : collectionsByIdentity.get(key);

      if (collection === undefined || key === undefined) {
        return this.#unavailable(
          providerIdentity,
          "icon discovery record contains an unavailable membership",
        );
      }

      memberships.push(collection.identity);
      membershipKeys.push(key);
    }

    if (new Set(membershipKeys).size !== membershipKeys.length) {
      return this.#conflict(
        providerIdentity,
        "icon discovery memberships must be unique",
      );
    }

    memberships.sort((left, right) => this.#ascii.compare(
      this.#identities.collection(left),
      this.#identities.collection(right),
    ));

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        identity,
        metadata,
        memberships: Object.freeze(memberships),
        ...(searchTerms === undefined ? {} : { searchTerms }),
      }),
    });
  }

  /**
   * @description Accepts optional provider-owned search terms in canonical unique form.
   * @param record - Snapshotted discovery record.
   * @returns Frozen canonical terms, no value when absent, or null after rejection.
   */
  #searchTerms(
    record: Readonly<Record<string, unknown>>,
  ): readonly string[] | undefined | null {
    if (!Object.hasOwn(record, "searchTerms")) {
      return undefined;
    }

    const values = this.#data.array(record.searchTerms);

    if (values === undefined || values.length === 0) {
      return null;
    }

    const terms = values.map((term) =>
      typeof term === "string" ? term.trim().toLowerCase() : "",
    );

    if (
      terms.some((term) => term.length === 0)
      || new Set(terms).size !== terms.length
    ) {
      return null;
    }

    return Object.freeze(terms);
  }

  /**
   * @description Creates one sanitised unavailable-provider rejection.
   * @param providerIdentity - Failing provider identity.
   * @param message - Deterministic Aster-owned explanation.
   * @returns Structured rejected record result.
   * @typeParam Value - Record family rejected before acceptance.
   */
  #unavailable<Value>(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.catalogueUnavailable,
        commandDiagnosticSchema.codes.catalogueUnavailable,
        message,
        [providerIdentity],
      ),
    });
  }

  /**
   * @description Creates one deterministic duplicate-claim rejection.
   * @param providerIdentity - Conflicting provider identity.
   * @param message - Deterministic conflict explanation.
   * @returns Structured rejected record result.
   * @typeParam Value - Record family rejected before acceptance.
   */
  #conflict<Value>(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.catalogueConflict,
        commandDiagnosticSchema.codes.catalogueConflict,
        message,
        [providerIdentity],
      ),
    });
  }
}
