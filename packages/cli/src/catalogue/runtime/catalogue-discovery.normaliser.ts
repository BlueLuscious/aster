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
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";
import { CatalogueDiscoveryMembershipValidator } from "./catalogue-discovery-membership.validator.js";
import { CatalogueDiscoveryRecordNormaliser } from "./catalogue-discovery-record.normaliser.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Coordinates discovery acceptance, cross-checking, ordering, and isolation.
 */
export class CatalogueDiscoveryNormaliser {
  /** @description Deterministic ASCII identity ordering authority. */
  readonly #ascii = new AsciiStringComparator();

  /** @description Exact discovery-container and dense-array inspection authority. */
  readonly #data = new StructuredDataInspector();

  /** @description Individual discovery-record acceptance boundary. */
  readonly #records = new CatalogueDiscoveryRecordNormaliser();

  /** @description Bidirectional metadata membership validator. */
  readonly #memberships = new CatalogueDiscoveryMembershipValidator();

  /** @description Canonical portable identity formatter used for indexing and ordering. */
  readonly #identities = new CatalogueIdentityFormatter();

  /** @description Immutable diagnostic constructor for discovery-level failures. */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Accepts one metadata-only provider discovery and isolates all retained values.
   * @param providerIdentity - Canonical identity of the supplying provider.
   * @param value - Candidate provider discovery.
   * @returns Accepted isolated discovery or structured provider rejection.
   */
  normalise(
    providerIdentity: string,
    value: unknown,
  ): TAcceptanceResult<TAcceptedCatalogueDiscovery> {
    const discovery = this.#data.record(
      value,
      catalogueDiscoverySchema.fields,
      catalogueDiscoverySchema.fields,
    );
    const iconValues = discovery === undefined
      ? undefined
      : this.#data.array(discovery.icons);
    const collectionValues = discovery === undefined
      ? undefined
      : this.#data.array(discovery.collections);

    if (
      discovery === undefined
      || iconValues === undefined
      || collectionValues === undefined
    ) {
      return this.#unavailable(
        providerIdentity,
        "expected complete catalogue discovery metadata",
      );
    }

    const collections: CatalogueDiscoveryCollectionRecord[] = [];
    const collectionsByIdentity = new Map<string, CatalogueDiscoveryCollectionRecord>();

    for (const candidate of collectionValues) {
      const accepted = this.#records.collection(providerIdentity, candidate);

      if (!accepted.accepted) {
        return accepted;
      }

      const identity = this.#identities.collection(accepted.value.identity);

      if (collectionsByIdentity.has(identity)) {
        return this.#conflict(
          providerIdentity,
          `duplicate collection identity ${identity}`,
        );
      }

      collections.push(accepted.value);
      collectionsByIdentity.set(identity, accepted.value);
    }

    const icons: CatalogueDiscoveryIconRecord[] = [];
    const iconsByIdentity = new Map<string, CatalogueDiscoveryIconRecord>();

    for (const candidate of iconValues) {
      const accepted = this.#records.icon(
        providerIdentity,
        candidate,
        collectionsByIdentity,
      );

      if (!accepted.accepted) {
        return accepted;
      }

      const identity = this.#identities.icon(accepted.value.identity);

      if (iconsByIdentity.has(identity)) {
        return this.#conflict(providerIdentity, `duplicate icon identity ${identity}`);
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

    collections.sort((left, right) => this.#ascii.compare(
      this.#identities.collection(left.identity),
      this.#identities.collection(right.identity),
    ));
    icons.sort((left, right) => this.#ascii.compare(
      this.#identities.icon(left.identity),
      this.#identities.icon(right.identity),
    ));

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
   * @returns Structured rejected discovery result.
   */
  #unavailable(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<TAcceptedCatalogueDiscovery> {
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
   * @returns Structured rejected discovery result.
   */
  #conflict(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<TAcceptedCatalogueDiscovery> {
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
