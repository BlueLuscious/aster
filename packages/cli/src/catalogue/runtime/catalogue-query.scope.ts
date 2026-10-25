import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { CatalogueDiscoveryIconRecord } from "../contracts/index.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";
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
   * @typeParam Catalogue - Accepted catalogue state carrying one provider identity.
   * @param catalogues - Accepted loaded catalogues.
   * @param identity - Optional exact provider identity.
   * @returns Selected immutable catalogue sequence or structured rejection.
   */
  selectCatalogues<
    Catalogue extends Readonly<{
      /** @description Accepted provider identity used for exact scope matching. */
      identity: string;
    }>,
  >(
    catalogues: readonly Catalogue[],
    identity: string | undefined,
  ): TAcceptanceResult<readonly Catalogue[]> {
    if (identity === undefined) {
      return Object.freeze({ accepted: true, value: catalogues });
    }

    const catalogue = catalogues.find(
      (candidate) => candidate.identity === identity,
    );

    if (catalogue === undefined) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create({
          category: commandDiagnosticSchema.categories.notFound,
          code: commandDiagnosticSchema.codes.notFound,
          message: `catalogue ${identity} was not found`,
          details: {
            kind: commandDiagnosticSchema.details.lookup,
            subject: commandDiagnosticSchema.catalogueSubject,
            identity,
          },
        }),
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
    catalogues: readonly TAcceptedCatalogueDiscovery[],
    identity: string | undefined,
  ): TAcceptanceResult<string | undefined> {
    if (identity === undefined) {
      return Object.freeze({ accepted: true, value: undefined });
    }

    const exists = catalogues.some((catalogue) =>
      catalogue.collections.some(
        (record) => this.#identities.collection(record.identity) === identity,
      ),
    );

    if (!exists) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create({
          category: commandDiagnosticSchema.categories.notFound,
          code: commandDiagnosticSchema.codes.notFound,
          message: `collection ${identity} was not found`,
          details: {
            kind: commandDiagnosticSchema.details.lookup,
            subject: asterCommandSubjects.show.collection,
            identity,
          },
        }),
      });
    }

    return Object.freeze({ accepted: true, value: identity });
  }

  /**
   * @description Checks glyph existence before applying unrelated icon-list predicates.
   * @param catalogues - Selected accepted provider scope.
   * @param identity - Optional exact namespace/name filter.
   * @returns Accepted filter or deterministic not-found evidence.
   */
  acceptGlyph(
    catalogues: readonly TAcceptedCatalogueDiscovery[],
    identity: string | undefined,
  ): TAcceptanceResult<string | undefined> {
    if (
      identity === undefined ||
      catalogues.some((catalogue) =>
        catalogue.icons.some((record) => this.matchesGlyph(record, identity)),
      )
    ) {
      return Object.freeze({ accepted: true, value: identity });
    }

    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create({
        category: commandDiagnosticSchema.categories.notFound,
        code: commandDiagnosticSchema.codes.notFound,
        message: `glyph ${identity} was not found`,
        details: {
          kind: commandDiagnosticSchema.details.lookup,
          subject: asterCommandSubjects.show.glyph,
          identity,
        },
      }),
    });
  }

  /**
   * @description Matches a concrete record to an optional exact glyph without namespace fallback.
   * @param record - Accepted icon discovery record.
   * @param identity - Optional canonical glyph key.
   * @returns Whether the concrete definition belongs to the selected family.
   */
  matchesGlyph(record: CatalogueDiscoveryIconRecord, identity: string | undefined): boolean {
    return identity === undefined || this.#identities.glyph(record.identity) === identity;
  }

  /**
   * @description Determines whether one icon has an optional exact collection membership.
   * @param record - Accepted icon record.
   * @param identity - Optional exact collection filter.
   * @returns Whether the icon belongs to the requested collection scope.
   */
  matchesCollection(
    record: CatalogueDiscoveryIconRecord,
    identity: string | undefined,
  ): boolean {
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
