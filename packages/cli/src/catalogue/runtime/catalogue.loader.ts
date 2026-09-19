import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import type { CatalogueProvider } from "../contracts/index.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";
import { CatalogueDiscoveryNormaliser } from "./catalogue-discovery.normaliser.js";
import { CatalogueSnapshotNormaliser } from "./catalogue-snapshot.normaliser.js";

/**
 * @description Accepts provider discovery and retains one temporary complete-definition bridge.
 */
export class CatalogueLoader {
  /**
   * @description Locale-independent ordering authority for canonical provider identities.
   */
  readonly #strings = new AsciiStringComparator();

  /**
   * @description Provider discovery acceptance boundary.
   */
  readonly #discoveries = new CatalogueDiscoveryNormaliser();

  /**
   * @description Temporary complete-definition snapshot acceptance boundary.
   */
  readonly #snapshots = new CatalogueSnapshotNormaliser();

  /**
   * @description Immutable diagnostic constructor for rejected provider operations.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Discovers and validates all providers without retaining catalogue state.
   * @param providers - Explicit unique provider sequence supplied by the host.
   * @returns Canonically ordered accepted discovery states or one deterministic rejection.
   */
  async discover(
    providers: readonly CatalogueProvider[],
  ): Promise<TAcceptanceResult<readonly TAcceptedCatalogueDiscovery[]>> {
    const orderedProviders = [...providers].sort((left, right) =>
      this.#strings.compare(left.identity, right.identity),
    );
    const settled = await Promise.allSettled(
      orderedProviders.map((provider) => provider.discover()),
    );
    const catalogues: TAcceptedCatalogueDiscovery[] = [];

    for (const [index, result] of settled.entries()) {
      const provider = orderedProviders[index];

      if (provider === undefined) {
        continue;
      }

      if (result.status === "rejected") {
        return this.#unavailable(
          provider.identity,
          "catalogue provider failed to discover metadata",
        );
      }

      let accepted: TAcceptanceResult<TAcceptedCatalogueDiscovery>;

      try {
        accepted = this.#discoveries.normalise(provider.identity, result.value);
      } catch {
        return this.#unavailable(
          provider.identity,
          "catalogue provider returned unreadable discovery metadata",
        );
      }

      if (!accepted.accepted) {
        return accepted;
      }

      catalogues.push(accepted.value);
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze(catalogues),
    });
  }

  /**
   * @description Reconstructs complete provider snapshots for commands awaiting exact migration.
   * @remarks This internal bridge deliberately invokes every discovered definition loader and is
   * not used by list, search, or show.
   * @param providers - Explicit unique provider sequence supplied by the host.
   * @returns Canonically ordered accepted complete catalogues or one deterministic rejection.
   */
  async loadDefinitions(
    providers: readonly CatalogueProvider[],
  ): Promise<TAcceptanceResult<readonly TAcceptedCatalogue[]>> {
    const discovered = await this.discover(providers);

    if (!discovered.accepted) {
      return discovered;
    }

    const providersByIdentity = new Map(
      providers.map((provider) => [provider.identity, provider]),
    );
    const catalogues: TAcceptedCatalogue[] = [];

    for (const catalogue of discovered.value) {
      const provider = providersByIdentity.get(catalogue.identity);

      if (provider === undefined) {
        return this.#unavailable(
          catalogue.identity,
          "catalogue provider became unavailable after discovery",
        );
      }

      const [iconResults, collectionResults] = await Promise.all([
        Promise.allSettled(
          catalogue.icons.map((record) => provider.loadIcon(record.identity)),
        ),
        Promise.allSettled(
          catalogue.collections.map((record) =>
            provider.loadCollection(record.identity),
          ),
        ),
      ]);

      if (
        iconResults.some((result) => result.status === "rejected")
        || collectionResults.some((result) => result.status === "rejected")
      ) {
        return this.#unavailable(
          catalogue.identity,
          "catalogue definition loader failed",
        );
      }

      const snapshot = {
        icons: iconResults.map((result, index) => ({
          definition: result.status === "fulfilled" ? result.value : undefined,
          memberships: catalogue.icons[index]?.memberships,
          ...(catalogue.icons[index]?.searchTerms === undefined
            ? {}
            : { searchTerms: catalogue.icons[index]?.searchTerms }),
        })),
        collections: collectionResults.map((result, index) => ({
          definition: result.status === "fulfilled" ? result.value : undefined,
          ...(catalogue.collections[index]?.searchTerms === undefined
            ? {}
            : { searchTerms: catalogue.collections[index]?.searchTerms }),
        })),
      };
      let accepted: TAcceptanceResult<TAcceptedCatalogue>;

      try {
        accepted = this.#snapshots.normalise(catalogue.identity, snapshot);
      } catch {
        return this.#unavailable(
          catalogue.identity,
          "catalogue provider returned unreadable definitions",
        );
      }

      if (!accepted.accepted) {
        return accepted;
      }

      catalogues.push(accepted.value);
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze(catalogues),
    });
  }

  /**
   * @description Creates one sanitised provider-unavailable rejection.
   * @param providerIdentity - Canonical identity of the failing provider.
   * @param message - Stable Aster-owned explanation.
   * @returns Immutable rejected catalogue acceptance result.
   * @typeParam Value - Accepted value family prevented by provider failure.
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
}
