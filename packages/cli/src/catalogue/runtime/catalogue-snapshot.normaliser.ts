import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
} from "../contracts/index.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueMembershipValidator } from "./catalogue-membership.validator.js";
import { CatalogueRecordNormaliser } from "./catalogue-record.normaliser.js";

/**
 * @description Coordinates record acceptance, cross-checking, ordering, and snapshot freezing.
 */
export class CatalogueSnapshotNormaliser {
  /**
   * @description Individual provider-record acceptance boundary.
   */
  readonly #records = new CatalogueRecordNormaliser();

  /**
   * @description Bidirectional membership evidence validator.
   */
  readonly #memberships = new CatalogueMembershipValidator();

  /**
   * @description Canonical portable identity formatter used for indexing and ordering.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Immutable diagnostic constructor for snapshot-level conflicts.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Accepts one complete provider snapshot and isolates all portable values.
   * @param providerIdentity - Canonical identity of the supplying provider.
   * @param value - Candidate provider snapshot.
   * @returns Accepted isolated catalogue or structured provider rejection.
   */
  normalise(
    providerIdentity: string,
    value: unknown,
  ): TAcceptanceResult<TAcceptedCatalogue> {
    if (
      !this.#isRecord(value) ||
      !this.#hasExactFields(value, ["icons", "collections"]) ||
      !Array.isArray(value.icons) ||
      !Array.isArray(value.collections)
    ) {
      return this.#unavailable(
        providerIdentity,
        "expected a complete catalogue snapshot",
      );
    }

    const collections: CatalogueCollectionRecord[] = [];
    const collectionsByIdentity = new Map<string, CatalogueCollectionRecord>();

    for (const candidate of value.collections) {
      const accepted = this.#records.collection(providerIdentity, candidate);

      if (!accepted.accepted) {
        return accepted;
      }

      const identity = this.#identities.collection(
        accepted.value.definition.identity,
      );

      if (collectionsByIdentity.has(identity)) {
        return this.#conflict(
          providerIdentity,
          `duplicate collection identity ${identity}`,
        );
      }

      collections.push(accepted.value);
      collectionsByIdentity.set(identity, accepted.value);
    }

    const icons: CatalogueIconRecord[] = [];
    const iconsByIdentity = new Map<string, CatalogueIconRecord>();

    for (const candidate of value.icons) {
      const accepted = this.#records.icon(
        providerIdentity,
        candidate,
        collectionsByIdentity,
      );

      if (!accepted.accepted) {
        return accepted;
      }

      const identity = this.#identities.icon(accepted.value.definition.identity);

      if (iconsByIdentity.has(identity)) {
        return this.#conflict(
          providerIdentity,
          `duplicate icon identity ${identity}`,
        );
      }

      icons.push(accepted.value);
      iconsByIdentity.set(identity, accepted.value);
    }

    const consistencyFailure = this.#memberships.inspect(
      collections,
      iconsByIdentity,
    );

    if (consistencyFailure !== undefined) {
      return this.#unavailable(providerIdentity, consistencyFailure);
    }

    collections.sort((left, right) =>
      this.#compare(
        this.#identities.collection(left.definition.identity),
        this.#identities.collection(right.definition.identity),
      ),
    );
    icons.sort((left, right) =>
      this.#compare(
        this.#identities.icon(left.definition.identity),
        this.#identities.icon(right.definition.identity),
      ),
    );

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        identity: providerIdentity,
        icons: Object.freeze(icons),
        collections: Object.freeze(collections),
      }),
    });
  }

  /**
   * @description Creates one sanitised unavailable-provider rejection.
   * @param providerIdentity - Failing provider identity.
   * @param message - Deterministic Aster-owned explanation.
   * @returns Structured rejected catalogue result.
   */
  #unavailable(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<TAcceptedCatalogue> {
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
   * @returns Structured rejected catalogue result.
   */
  #conflict(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<TAcceptedCatalogue> {
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
   * @description Determines whether a record exposes exactly the accepted own fields.
   * @param value - Record to inspect.
   * @param fields - Closed required field sequence.
   * @returns Whether no required field is missing and no unknown field exists.
   */
  #hasExactFields(
    value: Record<string, unknown>,
    fields: readonly string[],
  ): boolean {
    const keys = Object.keys(value);
    return (
      keys.length === fields.length &&
      fields.every((field) => Object.hasOwn(value, field))
    );
  }

  /**
   * @description Compares canonical ASCII identities without locale-sensitive behaviour.
   * @param left - Left canonical identity.
   * @param right - Right canonical identity.
   * @returns Negative, zero, or positive lexical relation.
   */
  #compare(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
