import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { CatalogueIconRecord } from "../contracts/index.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Applies shared exact provider, collection, membership, and tag query scope rules.
 */
export class CatalogueQueryScope {
  /**
   * @description Canonical portable identity formatter used for collection scope.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Immutable diagnostic constructor for invalid explicit filters.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Selects an optional exact provider or returns not-found evidence.
   * @param catalogues - Accepted loaded catalogues.
   * @param identity - Optional exact provider identity.
   * @returns Selected immutable catalogue sequence or structured rejection.
   */
  selectCatalogues(
    catalogues: readonly TAcceptedCatalogue[],
    identity: string | undefined,
  ): TAcceptanceResult<readonly TAcceptedCatalogue[]> {
    if (identity === undefined) {
      return Object.freeze({ accepted: true, value: catalogues });
    }

    const catalogue = catalogues.find((candidate) => candidate.identity === identity);

    if (catalogue === undefined) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create(
          commandDiagnosticSchema.categories.notFound,
          commandDiagnosticSchema.codes.notFound,
          `catalogue ${identity} was not found`,
          [identity],
        ),
      });
    }

    return Object.freeze({ accepted: true, value: Object.freeze([catalogue]) });
  }

  /**
   * @description Verifies that an optional collection filter exists in selected providers.
   * @param catalogues - Selected accepted catalogues.
   * @param identity - Optional exact collection identity.
   * @returns Accepted identity or structured not-found evidence.
   */
  acceptCollection(
    catalogues: readonly TAcceptedCatalogue[],
    identity: string | undefined,
  ): TAcceptanceResult<string | undefined> {
    if (identity === undefined) {
      return Object.freeze({ accepted: true, value: undefined });
    }

    const exists = catalogues.some((catalogue) =>
      catalogue.collections.some(
        (record) => this.#identities.collection(record.definition.identity) === identity,
      ),
    );

    if (!exists) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create(
          commandDiagnosticSchema.categories.notFound,
          commandDiagnosticSchema.codes.notFound,
          `collection ${identity} was not found`,
          [identity],
        ),
      });
    }

    return Object.freeze({ accepted: true, value: identity });
  }

  /**
   * @description Determines whether one icon has an optional exact collection membership.
   * @param record - Accepted icon record.
   * @param identity - Optional exact collection filter.
   * @returns Whether the icon belongs to the requested collection scope.
   */
  matchesCollection(record: CatalogueIconRecord, identity: string | undefined): boolean {
    return identity === undefined || record.memberships.some(
      (membership) => this.#identities.collection(membership) === identity,
    );
  }

  /**
   * @description Determines whether metadata contains every optional exact tag filter.
   * @param available - Optional intrinsic metadata tags.
   * @param required - Optional required canonical tags.
   * @returns Whether all required tags are available.
   */
  matchesTags(
    available: readonly string[] | undefined,
    required: readonly string[] | undefined,
  ): boolean {
    return required === undefined || required.every((tag) => available?.includes(tag) === true);
  }
}
