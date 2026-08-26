import {
  Collection,
  type CollectionDefinition,
  type CollectionIdentity,
  Icon,
  type IconDefinition,
} from "@aster/core";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
} from "../contracts/index.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import { CanonicalIdentityValidator } from "../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Accepts and isolates individual provider-owned icon and collection records.
 */
export class CatalogueRecordNormaliser {
  /**
   * @description Locale-independent ordering authority for canonical membership identities.
   */
  readonly #ascii = new AsciiStringComparator();

  /**
   * @description Exact provider-record and dense-array acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical provider-owned identity validator.
   */
  readonly #identityValidation = new CanonicalIdentityValidator();

  /**
   * @description Canonical portable identity formatter used for membership resolution.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Immutable diagnostic constructor for rejected records.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Accepts one provider-owned collection record and isolates its definition.
   * @param providerIdentity - Canonical identity of the supplying provider.
   * @param value - Candidate collection record.
   * @returns Accepted immutable collection record or structured provider rejection.
   */
  collection(
    providerIdentity: string,
    value: unknown,
  ): TAcceptanceResult<CatalogueCollectionRecord> {
    const record = this.#data.record(
      value,
      ["definition", "searchTerms"],
      ["definition"],
    );

    if (record === undefined) {
      return this.#unavailable(
        providerIdentity,
        "expected a valid collection record",
      );
    }

    const definition = this.#acceptCollection(record.definition);
    const searchTerms = this.#acceptSearchTerms(
      record.searchTerms,
      Object.hasOwn(record, "searchTerms"),
    );

    if (definition === undefined || searchTerms === null) {
      return this.#unavailable(
        providerIdentity,
        "collection record contains an invalid value",
      );
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        definition,
        ...(searchTerms === undefined ? {} : { searchTerms }),
      }),
    });
  }

  /**
   * @description Accepts one provider-owned icon record and resolves its collection evidence.
   * @param providerIdentity - Canonical identity of the supplying provider.
   * @param value - Candidate icon record.
   * @param collectionsByIdentity - Accepted collections available to membership resolution.
   * @returns Accepted immutable icon record or structured provider rejection.
   */
  icon(
    providerIdentity: string,
    value: unknown,
    collectionsByIdentity: ReadonlyMap<string, CatalogueCollectionRecord>,
  ): TAcceptanceResult<CatalogueIconRecord> {
    const record = this.#data.record(
      value,
      ["definition", "memberships", "searchTerms"],
      ["definition", "memberships"],
    );
    const membershipValues = record === undefined
      ? undefined
      : this.#data.array(record.memberships);

    if (record === undefined || membershipValues === undefined) {
      return this.#unavailable(providerIdentity, "expected a valid icon record");
    }

    const definition = this.#acceptIcon(record.definition);
    const searchTerms = this.#acceptSearchTerms(
      record.searchTerms,
      Object.hasOwn(record, "searchTerms"),
    );

    if (definition === undefined || searchTerms === null) {
      return this.#unavailable(
        providerIdentity,
        "icon record contains an invalid value",
      );
    }

    const memberships: CollectionIdentity[] = [];
    const membershipKeys: string[] = [];

    for (const membership of membershipValues) {
      const key = this.#acceptCollectionIdentity(membership);
      const collection = key === undefined
        ? undefined
        : collectionsByIdentity.get(key);

      if (key === undefined || collection === undefined) {
        return this.#unavailable(
          providerIdentity,
          "icon record contains an unavailable membership",
        );
      }

      memberships.push(collection.definition.identity);
      membershipKeys.push(key);
    }

    if (new Set(membershipKeys).size !== membershipKeys.length) {
      return this.#conflict(providerIdentity, "icon memberships must be unique");
    }

    memberships.sort((left, right) => {
      const leftIdentity = this.#identities.collection(left);
      const rightIdentity = this.#identities.collection(right);
      return this.#ascii.compare(leftIdentity, rightIdentity);
    });

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        definition,
        memberships: Object.freeze(memberships),
        ...(searchTerms === undefined ? {} : { searchTerms }),
      }),
    });
  }

  /**
   * @description Accepts and isolates one portable icon candidate through Core.
   * @param value - Candidate portable icon.
   * @returns Canonical isolated definition or no value after rejection.
   */
  #acceptIcon(value: unknown): IconDefinition | undefined {
    try {
      return Icon.define(value as IconDefinition);
    } catch {
      return undefined;
    }
  }

  /**
   * @description Accepts and isolates one portable collection candidate through Core.
   * @param value - Candidate portable collection.
   * @returns Canonical isolated definition or no value after rejection.
   */
  #acceptCollection(value: unknown): CollectionDefinition | undefined {
    try {
      return Collection.define(value as CollectionDefinition);
    } catch {
      return undefined;
    }
  }

  /**
   * @description Accepts optional provider-owned search terms in canonical unique form.
   * @param value - Candidate terms value.
   * @param present - Whether the optional field was supplied.
   * @returns Frozen canonical terms, no value when absent, or null after rejection.
   */
  #acceptSearchTerms(
    value: unknown,
    present: boolean,
  ): readonly string[] | undefined | null {
    if (!present) {
      return undefined;
    }

    const values = this.#data.array(value);

    if (values === undefined || values.length === 0) {
      return null;
    }

    const terms = values.map((term) =>
      typeof term === "string" ? term.trim().toLowerCase() : "",
    );

    if (
      terms.some((term) => term.length === 0) ||
      new Set(terms).size !== terms.length
    ) {
      return null;
    }

    return Object.freeze(terms);
  }

  /**
   * @description Accepts one collection-identity candidate for membership resolution.
   * @param value - Candidate portable collection identity.
   * @returns Canonical textual identity or no value after rejection.
   */
  #acceptCollectionIdentity(value: unknown): string | undefined {
    const identity = this.#data.record(value, ["namespace", "name"], ["name"]);

    if (
      identity === undefined
      || !this.#identityValidation.slug(identity.name)
      || (
        Object.hasOwn(identity, "namespace")
        && !this.#identityValidation.slug(identity.namespace)
      )
    ) {
      return undefined;
    }

    return this.#identities.collection(identity as unknown as CollectionIdentity);
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
