import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { AsterCommandShowSubjectType } from "../../command/types/index.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";
import type { TCatalogueDiscoverySelection } from "../types/internal/catalogue-discovery-selection.type.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueLoader } from "./catalogue.loader.js";
import { CatalogueQueryScope } from "./catalogue-query.scope.js";

/**
 * @description Resolves exact discovery metadata before any complete definition is loaded.
 */
export class CatalogueDiscoverySelector {
  /** @description Explicit provider discovery and acceptance boundary. */
  readonly #loader: CatalogueLoader;

  /** @description Shared exact-provider scope policy. */
  readonly #scope = new CatalogueQueryScope();

  /** @description Canonical portable identity formatter used for exact matching. */
  readonly #identities = new CatalogueIdentityFormatter();

  /** @description Immutable diagnostic constructor for selection failures. */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Creates one selector using the explicit shared discovery loader.
   * @param loader - Provider discovery and metadata acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
  }

  /**
   * @description Resolves one exact icon or collection metadata record.
   * @param subject - Exact portable value family to resolve.
   * @param identity - Canonical textual portable identity.
   * @param catalogue - Optional exact provider filter.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns One immutable discovery selection or deterministic lookup failure.
   */
  async select(
    subject: AsterCommandShowSubjectType,
    identity: string,
    catalogue: string | undefined,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<TCatalogueDiscoverySelection>> {
    const discovered = await this.#loader.discover(context.catalogues);

    if (!discovered.accepted) {
      return discovered;
    }

    const scoped = this.#scope.selectCatalogues(discovered.value, catalogue);

    if (!scoped.accepted) {
      return scoped;
    }

    const candidates = subject === asterCommandSubjects.show.icon
      ? this.#icons(scoped.value, identity)
      : this.#collections(scoped.value, identity);

    if (candidates.length === 0) {
      return this.#failure(
        commandDiagnosticSchema.categories.notFound,
        commandDiagnosticSchema.codes.notFound,
        `identity ${identity} was not found`,
        [identity],
      );
    }

    if (candidates.length > 1) {
      return this.#failure(
        commandDiagnosticSchema.categories.ambiguous,
        commandDiagnosticSchema.codes.ambiguous,
        `identity ${identity} is available from multiple catalogues`,
        candidates.map((candidate) => candidate.catalogue),
      );
    }

    return Object.freeze({
      accepted: true,
      value: candidates[0] as TCatalogueDiscoverySelection,
    });
  }

  /**
   * @description Selects exact icon metadata from canonically ordered catalogues.
   * @param catalogues - Accepted provider discovery scope.
   * @param identity - Canonical textual icon identity.
   * @returns Immutable exact icon metadata selections.
   */
  #icons(
    catalogues: readonly TAcceptedCatalogueDiscovery[],
    identity: string,
  ): readonly TCatalogueDiscoverySelection[] {
    return Object.freeze(catalogues.flatMap((catalogue) => catalogue.icons
      .filter((record) => this.#identities.icon(record.identity) === identity)
      .map((record) => Object.freeze({
        catalogue: catalogue.identity,
        subject: asterCommandSubjects.show.icon,
        identity,
        icon: record,
        icons: Object.freeze([record]),
      }))));
  }

  /**
   * @description Selects exact collection metadata from canonically ordered catalogues.
   * @param catalogues - Accepted provider discovery scope.
   * @param identity - Canonical textual collection identity.
   * @returns Immutable exact collection metadata selections.
   */
  #collections(
    catalogues: readonly TAcceptedCatalogueDiscovery[],
    identity: string,
  ): readonly TCatalogueDiscoverySelection[] {
    return Object.freeze(catalogues.flatMap((catalogue) => catalogue.collections
      .filter((record) => this.#identities.collection(record.identity) === identity)
      .map((record) => {
        const memberIdentities = new Set(record.icons.map((icon) =>
          this.#identities.icon(icon),
        ));

        return Object.freeze({
          catalogue: catalogue.identity,
          subject: asterCommandSubjects.show.collection,
          identity,
          collection: record,
          icons: Object.freeze(catalogue.icons.filter((icon) =>
            memberIdentities.has(this.#identities.icon(icon.identity)),
          )),
        });
      })));
  }

  /**
   * @description Creates one deterministic rejected discovery selection.
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
  ): TAcceptanceResult<TCatalogueDiscoverySelection> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(category, code, message, related),
    });
  }
}
