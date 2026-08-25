import type { IconDefinition } from "@aster/core";
import { CatalogueIdentityFormatter } from "../../catalogue/runtime/catalogue-identity.formatter.js";
import { CatalogueLoader } from "../../catalogue/runtime/catalogue.loader.js";
import { CatalogueQueryScope } from "../../catalogue/runtime/catalogue-query.scope.js";
import type { TAcceptedCatalogue } from "../../catalogue/types/internal/accepted-catalogue.type.js";
import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { AsterCommandInvocationType } from "../../command/types/index.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { TExportSelection } from "../types/internal/export-selection.type.js";

/**
 * @description Resolves one exact icon or collection from accepted explicit catalogues.
 */
export class CatalogueExportSelector {
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
   * @description Creates one export selector using the explicit shared catalogue loader.
   * @param loader - Provider loading and snapshot acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
  }

  /**
   * @description Resolves one exact export subject and all required icon definitions.
   * @param invocation - Canonical structured export request.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns One immutable selection or deterministic lookup failure.
   */
  async select(
    invocation: Extract<
      AsterCommandInvocationType,
      { command: typeof asterCommandNames.export }
    >,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<TExportSelection>> {
    const loaded = await this.#loader.load(context.catalogues);

    if (!loaded.accepted) {
      return loaded;
    }

    const scoped = this.#scope.selectCatalogues(
      loaded.value,
      invocation.catalogue,
    );

    if (!scoped.accepted) {
      return scoped;
    }

    const candidates = invocation.subject === asterCommandSubjects.export.icon
      ? this.#icons(scoped.value, invocation.identity)
      : this.#collections(scoped.value, invocation.identity);

    if (candidates.length === 0) {
      return this.#failure(
        commandDiagnosticSchema.categories.notFound,
        commandDiagnosticSchema.codes.notFound,
        `identity ${invocation.identity} was not found`,
        [invocation.identity],
      );
    }

    if (candidates.length > 1) {
      return this.#failure(
        commandDiagnosticSchema.categories.ambiguous,
        commandDiagnosticSchema.codes.ambiguous,
        `identity ${invocation.identity} is available from multiple catalogues`,
        candidates.map((candidate) => candidate.catalogue),
      );
    }

    return Object.freeze({ accepted: true, value: candidates[0] as TExportSelection });
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
  ): readonly TExportSelection[] {
    return Object.freeze(catalogues.flatMap((catalogue) =>
      catalogue.icons
        .filter((record) =>
          this.#identities.icon(record.definition.identity) === identity,
        )
        .map((record) => Object.freeze({
          catalogue: catalogue.identity,
          subject: asterCommandSubjects.export.icon,
          identity,
          definitions: Object.freeze([record.definition]),
        })),
    ));
  }

  /**
   * @description Selects exact collection candidates and resolves their provider-owned members.
   * @param catalogues - Accepted provider scope.
   * @param identity - Canonical textual collection identity.
   * @returns Immutable exact collection selections.
   */
  #collections(
    catalogues: readonly TAcceptedCatalogue[],
    identity: string,
  ): readonly TExportSelection[] {
    const selections: TExportSelection[] = [];

    for (const catalogue of catalogues) {
      const collection = catalogue.collections.find((record) =>
        this.#identities.collection(record.definition.identity) === identity,
      );

      if (collection === undefined) {
        continue;
      }

      const memberKeys = collection.definition.icons.map((definition) =>
        this.#identities.icon(definition.identity),
      );
      const definitions: IconDefinition[] = [];

      for (const memberKey of memberKeys) {
        const record = catalogue.icons.find((candidate) =>
          this.#identities.icon(candidate.definition.identity) === memberKey,
        );

        if (record !== undefined) {
          definitions.push(record.definition);
        }
      }

      definitions.sort((left, right) => {
        const leftIdentity = this.#identities.icon(left.identity);
        const rightIdentity = this.#identities.icon(right.identity);
        return leftIdentity < rightIdentity ? -1 : leftIdentity > rightIdentity ? 1 : 0;
      });
      selections.push(Object.freeze({
        catalogue: catalogue.identity,
        subject: asterCommandSubjects.export.collection,
        identity,
        definitions: Object.freeze(definitions),
      }));
    }

    return Object.freeze(selections);
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
  ): TAcceptanceResult<TExportSelection> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(category, code, message, related),
    });
  }
}

