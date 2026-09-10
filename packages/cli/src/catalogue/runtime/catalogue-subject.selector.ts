import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { AsterCommandShowSubjectType } from "../../command/types/index.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";
import type { TCatalogueSelection } from "../types/internal/catalogue-selection.type.js";
import type { TCatalogueSelectedIcon } from "../types/internal/catalogue-selected-icon.type.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueLoader } from "./catalogue.loader.js";
import { CatalogueQueryScope } from "./catalogue-query.scope.js";

/**
 * @description Resolves one exact portable subject for host-neutral catalogue consumers.
 */
export class CatalogueSubjectSelector {
  /**
   * @description Explicit provider loading and snapshot acceptance boundary.
   */
  readonly #loader: CatalogueLoader;

  /**
   * @description Shared exact-provider scope policy.
   */
  readonly #scope = new CatalogueQueryScope();

  /**
   * @description Canonical portable identity formatter used for exact matching.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Immutable diagnostic constructor for selection failures.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Canonical deterministic string-ordering policy.
   */
  readonly #strings = new AsciiStringComparator();

  /**
   * @description Creates one selector using the explicit shared catalogue loader.
   * @param loader - Provider loading and snapshot acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
  }

  /**
   * @description Resolves one exact icon or collection and its required icon evidence.
   * @param subject - Exact portable value family to resolve.
   * @param identity - Canonical textual portable identity.
   * @param catalogue - Optional exact provider filter.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns One immutable selection or deterministic lookup failure.
   */
  async select(
    subject: AsterCommandShowSubjectType,
    identity: string,
    catalogue: string | undefined,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<TCatalogueSelection>> {
    const loaded = await this.#loader.load(context.catalogues);

    if (!loaded.accepted) {
      return loaded;
    }

    const scoped = this.#scope.selectCatalogues(loaded.value, catalogue);

    if (!scoped.accepted) {
      return scoped;
    }

    const candidates = subject === asterCommandSubjects.show.icon
      ? this.#icons(scoped.value, identity)
      : this.#collections(scoped.value, identity);

    if (!candidates.accepted) {
      return candidates;
    }

    if (candidates.value.length === 0) {
      return this.#failure(
        commandDiagnosticSchema.categories.notFound,
        commandDiagnosticSchema.codes.notFound,
        `identity ${identity} was not found`,
        [identity],
      );
    }

    if (candidates.value.length > 1) {
      return this.#failure(
        commandDiagnosticSchema.categories.ambiguous,
        commandDiagnosticSchema.codes.ambiguous,
        `identity ${identity} is available from multiple catalogues`,
        candidates.value.map((candidate) => candidate.catalogue),
      );
    }

    return Object.freeze({
      accepted: true,
      value: candidates.value[0] as TCatalogueSelection,
    });
  }

  /**
   * @description Selects exact icon candidates from canonically ordered catalogues.
   * @param catalogues - Accepted provider scope.
   * @param identity - Canonical textual icon identity.
   * @returns Immutable exact icon selections.
   */
  #icons(
    catalogues: readonly TAcceptedCatalogue[],
    identity: string,
  ): TAcceptanceResult<readonly TCatalogueSelection[]> {
    return Object.freeze({
      accepted: true,
      value: Object.freeze(catalogues.flatMap((catalogue) => catalogue.icons
        .filter((record) =>
          this.#identities.icon(record.definition.identity) === identity,
        )
        .map((record) => Object.freeze({
          catalogue: catalogue.identity,
          subject: asterCommandSubjects.show.icon,
          identity,
          icons: Object.freeze([Object.freeze({
            definition: record.definition,
            memberships: record.memberships,
          })]),
        })))),
    });
  }

  /**
   * @description Selects collections and resolves every member against canonical icon records.
   * @param catalogues - Accepted provider scope.
   * @param identity - Canonical textual collection identity.
   * @returns Immutable exact collection selections or inconsistent-provider failure.
   */
  #collections(
    catalogues: readonly TAcceptedCatalogue[],
    identity: string,
  ): TAcceptanceResult<readonly TCatalogueSelection[]> {
    const selections: TCatalogueSelection[] = [];

    for (const catalogue of catalogues) {
      const collection = catalogue.collections.find((record) =>
        this.#identities.collection(record.definition.identity) === identity,
      );

      if (collection === undefined) {
        continue;
      }

      const iconsByIdentity = new Map(catalogue.icons.map((record) => [
        this.#identities.icon(record.definition.identity),
        record,
      ]));
      const icons: TCatalogueSelectedIcon[] = [];

      for (const member of collection.definition.icons) {
        const memberIdentity = this.#identities.icon(member.identity);
        const record = iconsByIdentity.get(memberIdentity);

        if (record === undefined) {
          return Object.freeze({
            accepted: false,
            diagnostic: this.#diagnostics.create(
              commandDiagnosticSchema.categories.catalogueUnavailable,
              commandDiagnosticSchema.codes.catalogueUnavailable,
              `collection ${identity} contains unavailable icon ${memberIdentity}`,
              [catalogue.identity, memberIdentity],
            ),
          });
        }

        icons.push(Object.freeze({
          definition: record.definition,
          memberships: record.memberships,
        }));
      }

      icons.sort((left, right) => this.#strings.compare(
        this.#identities.icon(left.definition.identity),
        this.#identities.icon(right.definition.identity),
      ));
      selections.push(Object.freeze({
        catalogue: catalogue.identity,
        subject: asterCommandSubjects.show.collection,
        identity,
        collection: collection.definition,
        icons: Object.freeze(icons),
      }));
    }

    return Object.freeze({ accepted: true, value: Object.freeze(selections) });
  }

  /**
   * @description Creates one deterministic rejected selection.
   * @param category - Stable command diagnostic category.
   * @param code - Stable command diagnostic code.
   * @param message - Deterministic failure explanation.
   * @param related - Canonically ordered related values.
   * @returns Immutable rejected acceptance result.
   */
  #failure(
    category: "not-found" | "ambiguous",
    code: "ASTER-CLI-004" | "ASTER-CLI-005",
    message: string,
    related: readonly string[],
  ): TAcceptanceResult<TCatalogueSelection> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(category, code, message, related),
    });
  }
}
