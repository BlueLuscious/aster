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
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Accepts and isolates individual provider-owned icon and collection records.
 */
export class CatalogueRecordNormaliser {
  /**
   * @description Canonical ASCII slug grammar for supplied membership identities.
   */
  readonly #slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

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
    if (
      !this.#isRecord(value) ||
      !this.#hasOnlyFields(value, ["definition", "searchTerms"]) ||
      !Object.hasOwn(value, "definition")
    ) {
      return this.#unavailable(
        providerIdentity,
        "expected a valid collection record",
      );
    }

    const definition = this.#acceptCollection(value.definition);
    const searchTerms = this.#acceptSearchTerms(
      value.searchTerms,
      Object.hasOwn(value, "searchTerms"),
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
    if (
      !this.#isRecord(value) ||
      !this.#hasOnlyFields(value, ["definition", "memberships", "searchTerms"]) ||
      !Object.hasOwn(value, "definition") ||
      !Array.isArray(value.memberships)
    ) {
      return this.#unavailable(providerIdentity, "expected a valid icon record");
    }

    const definition = this.#acceptIcon(value.definition);
    const searchTerms = this.#acceptSearchTerms(
      value.searchTerms,
      Object.hasOwn(value, "searchTerms"),
    );

    if (definition === undefined || searchTerms === null) {
      return this.#unavailable(
        providerIdentity,
        "icon record contains an invalid value",
      );
    }

    const memberships: CollectionIdentity[] = [];
    const membershipKeys: string[] = [];

    for (const membership of value.memberships) {
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
      return leftIdentity < rightIdentity
        ? -1
        : leftIdentity > rightIdentity
          ? 1
          : 0;
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

    if (!Array.isArray(value) || value.length === 0) {
      return null;
    }

    const terms = value.map((term) =>
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
    if (
      !this.#isRecord(value) ||
      !this.#hasOnlyFields(value, ["namespace", "name"]) ||
      !this.#isSlug(value.name) ||
      (Object.hasOwn(value, "namespace") && !this.#isSlug(value.namespace))
    ) {
      return undefined;
    }

    return this.#identities.collection(value as unknown as CollectionIdentity);
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

  /**
   * @description Determines whether a candidate is a non-null string-keyed record.
   * @param value - Candidate value.
   * @returns Whether own fields can be inspected safely.
   */
  #isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /**
   * @description Determines whether a record contains no field outside a closed set.
   * @param value - Record to inspect.
   * @param fields - Accepted own fields.
   * @returns Whether every own field is accepted.
   */
  #hasOnlyFields(
    value: Record<string, unknown>,
    fields: readonly string[],
  ): boolean {
    return Object.keys(value).every((field) => fields.includes(field));
  }

  /**
   * @description Determines whether a candidate is a canonical ASCII lowercase kebab-case slug.
   * @param value - Candidate slug.
   * @returns Whether the candidate matches the accepted grammar.
   */
  #isSlug(value: unknown): value is string {
    return typeof value === "string" && this.#slugPattern.test(value);
  }
}
