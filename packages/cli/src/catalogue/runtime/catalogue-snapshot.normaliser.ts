import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
} from "../contracts/index.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueMembershipValidator } from "./catalogue-membership.validator.js";
import { CatalogueRecordNormaliser } from "./catalogue-record.normaliser.js";

/**
 * @description Coordinates record acceptance, cross-checking, ordering, and snapshot freezing.
 */
export class CatalogueSnapshotNormaliser {
  /**
   * @description Deterministic ASCII identity ordering authority.
   */
  readonly #ascii = new AsciiStringComparator();

  /**
   * @description Exact snapshot-record and dense-array acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

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
    const snapshot = this.#data.record(
      value,
      ["icons", "collections"],
      ["icons", "collections"],
    );
    const iconValues = snapshot === undefined
      ? undefined
      : this.#data.array(snapshot.icons);
    const collectionValues = snapshot === undefined
      ? undefined
      : this.#data.array(snapshot.collections);

    if (snapshot === undefined || iconValues === undefined || collectionValues === undefined) {
      return this.#unavailable(
        providerIdentity,
        "expected a complete catalogue snapshot",
      );
    }

    const collections: CatalogueCollectionRecord[] = [];
    const collectionsByIdentity = new Map<string, CatalogueCollectionRecord>();

    for (const candidate of collectionValues) {
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

    for (const candidate of iconValues) {
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
      this.#ascii.compare(
        this.#identities.collection(left.definition.identity),
        this.#identities.collection(right.definition.identity),
      ),
    );
    icons.sort((left, right) =>
      this.#ascii.compare(
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

}
